using System.Diagnostics;
using System.Globalization;
using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Application.Services;

/// <summary>
/// سرویس محاسبه نیاز سفارش.
/// این سرویس چرخه کامل «خواندن پارامتر ← موجودی ← مصرف ← قواعد ← پیشنهاد ← تاریخچه» را اجرا می‌کند.
/// هیچ محاسبه‌ای در فرانت‌اند انجام نمی‌شود.
/// </summary>
public class ReplenishmentService : IReplenishmentService
{
    private static readonly CultureInfo Inv = CultureInfo.InvariantCulture;

    private readonly IReplenishmentDataRepository _data;
    private readonly IAutomationRepository _automation;

    public ReplenishmentService(IReplenishmentDataRepository data, IAutomationRepository automation)
    {
        _data = data;
        _automation = automation;
    }

    private static string N(decimal value) => value.ToString("0.##", Inv);

    public async Task<ReplenishmentResultDto> CalculateAsync(
        ReplenishmentFilterDto filter, string triggeredBy, CancellationToken ct = default)
    {
        var stopwatch = Stopwatch.StartNew();
        var asOf = filter.ToDate ?? DateTime.UtcNow;

        var run = new AutomationRun
        {
            StartedAt = DateTime.UtcNow,
            TriggerType = filter.TriggerType,
            Status = AutomationRunStatus.Running,
            TriggeredBy = triggeredBy
        };

        run.AuditLogs.Add(Log(AuditEventType.RunStarted, null, null,
            $"اجرای اتوماسیون سفارش‌دهی با نوع «{PersianNames.TriggerType(filter.TriggerType)}» آغاز شد."));

        List<ReplenishmentInput> inputs;
        try
        {
            inputs = await _data.LoadInputsAsync(filter, ct);
        }
        catch (Exception ex)
        {
            run.Status = AutomationRunStatus.Failed;
            run.FinishedAt = DateTime.UtcNow;
            run.AuditLogs.Add(Log(AuditEventType.ItemError, null, null,
                $"خواندن اطلاعات پایه با خطا مواجه شد: {ex.Message}"));
            await _automation.AddRunAsync(run, ct);
            await _automation.SaveChangesAsync(ct);
            throw new BusinessRuleException(ResultCodes.InternalError,
                "خواندن اطلاعات پایه برای محاسبه نیاز سفارش با خطا مواجه شد.",
                innerException: ex);
        }

        foreach (var input in inputs)
        {
            EvaluateSingle(run, input, asOf, filter);
        }

        run.TotalItems = inputs.Count;
        run.RecommendedItems = run.Recommendations.Count(r => r.Status == RecommendationStatus.NeedsOrder);
        run.ReviewItems = run.Recommendations.Count(r => r.Status == RecommendationStatus.NeedsReview);
        run.SkippedItems = run.Recommendations.Count(r =>
            r.Status is RecommendationStatus.NoNeed or RecommendationStatus.OpenRequestExists);
        run.ErrorItems = run.Recommendations.Count(r => r.Status == RecommendationStatus.ConfigurationError);
        run.Status = AutomationRunStatus.Completed;
        run.FinishedAt = DateTime.UtcNow;

        run.AuditLogs.Add(Log(AuditEventType.RunFinished, null, null,
            $"پایان اجرا — بررسی‌شده: {run.TotalItems}، پیشنهاد: {run.RecommendedItems}، " +
            $"نیازمند بررسی: {run.ReviewItems}، کنارگذاشته: {run.SkippedItems}، خطا: {run.ErrorItems}."));

        await _automation.AddRunAsync(run, ct);
        await _automation.SaveChangesAsync(ct);

        stopwatch.Stop();

        return new ReplenishmentResultDto
        {
            Summary = MapSummary(run, stopwatch.Elapsed.TotalMilliseconds),
            Recommendations = run.Recommendations
                .Select(r => MapRecommendation(r, inputs))
                .OrderBy(r => (int)OrderOfStatus(r.Status))
                .ThenBy(r => r.ProductCode, StringComparer.Ordinal)
                .ToList()
        };
    }

    // ------------------------------------------------------------------
    // ارزیابی یک ترکیب کالا/انبار/سایت
    // ------------------------------------------------------------------

    private void EvaluateSingle(
        AutomationRun run, ReplenishmentInput input, DateTime asOf, ReplenishmentFilterDto filter)
    {
        var parameter = input.Parameter;

        var recommendation = new ReplenishmentRecommendation
        {
            ProductId = input.ProductId,
            WarehouseId = input.WarehouseId,
            SiteId = input.SiteId,
            InventoryOrderParameterId = parameter?.Id,
            UnitOfMeasureId = parameter?.UnitOfMeasureId ?? input.UnitOfMeasure?.Id ?? 0,
            OnHandQuantity = input.OnHandQuantity,
            ReservedQuantity = input.ReservedQuantity,
            ConfirmedIncomingQuantity = input.ConfirmedIncomingQuantity,
            ExistingOpenRequestQuantity = input.OpenPurchaseRequestQuantity,
            ReorderPoint = parameter?.ReorderPoint,
            MinimumStock = parameter?.MinimumStock,
            MaximumStock = parameter?.MaximumStock,
            OrderingMethod = parameter?.OrderingMethod,
            RequestClassificationId = parameter?.DefaultRequestClassificationId,
            CreatedAt = DateTime.UtcNow
        };

        // ۱. قواعد استثنا روی پارامتر و داده موجودی
        var validation = ReplenishmentCalculator.ValidateInput(input, asOf);
        if (validation.Outcome != EvaluationOutcome.Proceed)
        {
            recommendation.Reason = validation.Message;
            recommendation.ReasonCode = validation.Code;
            recommendation.Status = validation.Outcome == EvaluationOutcome.Error
                ? RecommendationStatus.ConfigurationError
                : RecommendationStatus.NoNeed;

            run.AuditLogs.Add(Log(
                validation.Outcome == EvaluationOutcome.Error ? AuditEventType.ItemError : AuditEventType.ItemSkipped,
                input.ProductId, input.WarehouseId,
                $"{ProductLabel(input)}: {validation.Message}"));

            run.Recommendations.Add(recommendation);
            return;
        }

        // پس از ValidateInput، وجود پارامتر تضمین شده است
        var p = parameter!;

        run.AuditLogs.Add(Log(AuditEventType.ParameterEvaluated, p.ProductId, p.WarehouseId,
            $"{ProductLabel(input)}: پارامتر معتبر است — نحوه سفارش‌دهی «{PersianNames.OrderingMethod(p.OrderingMethod)}»."));

        // ۲. موجودی موثر
        var effectiveStock = ReplenishmentCalculator.CalculateEffectiveStock(
            input.OnHandQuantity,
            input.ConfirmedIncomingQuantity,
            input.ReservedQuantity,
            input.OpenPurchaseRequestQuantity);

        recommendation.EffectiveStock = effectiveStock;

        run.AuditLogs.Add(Log(AuditEventType.StockCalculated, p.ProductId, p.WarehouseId,
            $"{ProductLabel(input)}: موجودی موثر = {N(input.OnHandQuantity)} + {N(input.ConfirmedIncomingQuantity)} " +
            $"- {N(input.ReservedQuantity)} - {N(input.OpenPurchaseRequestQuantity)} = {N(effectiveStock)}."));

        // ۳. میانگین مصرف روزانه
        var averageDailyConsumption = ReplenishmentCalculator.CalculateAverageDailyConsumption(
            input.TotalConsumption, input.ConsumptionWindowDays);
        recommendation.AverageDailyConsumption = averageDailyConsumption;

        // ۴. کنترل خرید تکراری — پیش از تولید پیشنهاد بررسی می‌شود
        // وجود هر درخواست خرید باز روی همین کلید کسب‌وکار، مانع پیشنهاد جدید می‌شود.
        if (input.OpenPurchaseRequestQuantity > 0)
        {
            recommendation.Status = RecommendationStatus.OpenRequestExists;
            recommendation.ReasonCode = ResultCodes.OpenRequestExists;
            recommendation.Reason =
                $"برای این کالا در این انبار و سایت، درخواست خرید باز به مقدار " +
                $"{N(input.OpenPurchaseRequestQuantity)} وجود دارد؛ برای جلوگیری از خرید تکراری پیشنهاد جدیدی ایجاد نشد.";

            run.AuditLogs.Add(Log(AuditEventType.DuplicateRequestDetected, p.ProductId, p.WarehouseId,
                $"{ProductLabel(input)}: {recommendation.Reason}"));

            run.Recommendations.Add(recommendation);
            return;
        }

        // ۵. قاعده سفارش‌دهی
        var rule = ReplenishmentCalculator.ApplyRule(p, effectiveStock, averageDailyConsumption);
        recommendation.RawSuggestedQuantity = rule.RawQuantity;

        run.AuditLogs.Add(Log(AuditEventType.RuleApplied, p.ProductId, p.WarehouseId,
            $"{ProductLabel(input)}: {rule.Message}",
            beforeValue: N(effectiveStock),
            afterValue: N(rule.RawQuantity)));

        if (rule.Outcome == EvaluationOutcome.Error)
        {
            recommendation.Reason = rule.Message;
            recommendation.ReasonCode = rule.Code;
            recommendation.Status = RecommendationStatus.ConfigurationError;
            run.AuditLogs.Add(Log(AuditEventType.ItemError, p.ProductId, p.WarehouseId,
                $"{ProductLabel(input)}: {rule.Message}"));
            run.Recommendations.Add(recommendation);
            return;
        }

        if (!rule.Triggered)
        {
            recommendation.Status = RecommendationStatus.NoNeed;
            recommendation.ReasonCode = rule.Code;
            recommendation.Reason = rule.Message;

            run.AuditLogs.Add(Log(AuditEventType.ItemSkipped, p.ProductId, p.WarehouseId,
                $"{ProductLabel(input)}: {rule.Message}"));

            run.Recommendations.Add(recommendation);
            return;
        }

        // ۶. نرمال‌سازی مقدار
        var normalization = ReplenishmentCalculator.Normalize(p, rule.RawQuantity);
        recommendation.SuggestedQuantity = normalization.Quantity;

        if (normalization.AppliedSteps.Count > 0)
        {
            run.AuditLogs.Add(Log(AuditEventType.QuantityNormalized, p.ProductId, p.WarehouseId,
                $"{ProductLabel(input)}: {string.Join(" ← ", normalization.AppliedSteps)}",
                beforeValue: N(rule.RawQuantity),
                afterValue: N(normalization.Quantity)));
        }

        switch (normalization.Outcome)
        {
            case EvaluationOutcome.Skip:
                recommendation.Status = RecommendationStatus.NoNeed;
                recommendation.ReasonCode = normalization.Code;
                recommendation.Reason = normalization.Message;
                run.AuditLogs.Add(Log(AuditEventType.ItemSkipped, p.ProductId, p.WarehouseId,
                    $"{ProductLabel(input)}: {normalization.Message}"));
                break;

            case EvaluationOutcome.RequireReview:
                recommendation.Status = RecommendationStatus.NeedsReview;
                recommendation.ReasonCode = normalization.Code;
                recommendation.Reason = $"{rule.Message} {normalization.Message}";
                run.AuditLogs.Add(Log(AuditEventType.RecommendationCreated, p.ProductId, p.WarehouseId,
                    $"{ProductLabel(input)}: پیشنهاد نیازمند بررسی به مقدار {N(normalization.Quantity)} ایجاد شد."));
                break;

            default:
                recommendation.Status = RecommendationStatus.NeedsOrder;
                recommendation.ReasonCode = rule.Code;
                recommendation.Reason = rule.Message;
                run.AuditLogs.Add(Log(AuditEventType.RecommendationCreated, p.ProductId, p.WarehouseId,
                    $"{ProductLabel(input)}: پیشنهاد سفارش به مقدار {N(normalization.Quantity)} ایجاد شد."));
                break;
        }

        // ۷. اعمال فیلتر «درصد مازاد موجودی به پارامتر مقایسه»
        if (!PassesComparisonFilter(filter, p, effectiveStock))
        {
            recommendation.Status = RecommendationStatus.NoNeed;
            recommendation.ReasonCode = ResultCodes.StockSufficient;
            recommendation.Reason =
                $"موجودی موثر ({N(effectiveStock)}) خارج از محدوده «درصد مازاد به پارامتر مقایسه» است.";
        }

        run.Recommendations.Add(recommendation);
    }

    /// <summary>
    /// فیلتر «پارامتر مقایسه» و «درصد مازاد موجودی به پارامتر مقایسه».
    /// فقط کالاهایی نگه داشته می‌شوند که موجودی موثر آن‌ها از
    /// (پارامتر مقایسه × (۱ + درصد/۱۰۰)) بیشتر نباشد.
    /// </summary>
    private static bool PassesComparisonFilter(
        ReplenishmentFilterDto filter, InventoryOrderParameter parameter, decimal effectiveStock)
    {
        if (filter.ComparisonParameter is null || filter.SurplusPercentage is null)
            return true;

        decimal? comparisonValue = filter.ComparisonParameter switch
        {
            Dtos.ComparisonParameter.ReorderPoint => parameter.ReorderPoint,
            Dtos.ComparisonParameter.MinimumStock => parameter.MinimumStock,
            Dtos.ComparisonParameter.MaximumStock => parameter.MaximumStock,
            Dtos.ComparisonParameter.DesiredStockLevel => parameter.DesiredStockLevel,
            _ => null
        };

        if (comparisonValue is null or 0m)
            return true;

        var threshold = comparisonValue.Value * (1m + filter.SurplusPercentage.Value / 100m);
        return effectiveStock <= threshold;
    }

    private static int OrderOfStatus(RecommendationStatus status) => status switch
    {
        RecommendationStatus.NeedsOrder => 1,
        RecommendationStatus.NeedsReview => 2,
        RecommendationStatus.OpenRequestExists => 3,
        RecommendationStatus.ConfigurationError => 4,
        RecommendationStatus.DraftCreated => 5,
        RecommendationStatus.NoNeed => 6,
        _ => 9
    };

    private static string ProductLabel(ReplenishmentInput input)
        => input.Product is null
            ? $"کالا {input.ProductId}"
            : $"{input.Product.Name} ({input.Product.Code})";

    private static AutomationAuditLog Log(
        AuditEventType eventType, int? productId, int? warehouseId, string message,
        string? beforeValue = null, string? afterValue = null)
        => new()
        {
            EventType = eventType,
            ProductId = productId,
            WarehouseId = warehouseId,
            Message = message,
            BeforeValue = beforeValue,
            AfterValue = afterValue,
            CreatedAt = DateTime.UtcNow
        };

    // ------------------------------------------------------------------
    // نگاشت به DTO
    // ------------------------------------------------------------------

    public static ReplenishmentSummaryDto MapSummary(AutomationRun run, double durationMs)
        => new()
        {
            AutomationRunId = run.Id,
            StartedAt = run.StartedAt,
            FinishedAt = run.FinishedAt,
            TriggerType = run.TriggerType,
            TriggerTypeName = PersianNames.TriggerType(run.TriggerType),
            Status = run.Status,
            StatusName = PersianNames.RunStatus(run.Status),
            TotalItems = run.TotalItems,
            RecommendedItems = run.RecommendedItems,
            ReviewItems = run.ReviewItems,
            SkippedItems = run.SkippedItems,
            ErrorItems = run.ErrorItems,
            DurationMs = durationMs > 0
                ? durationMs
                : (run.FinishedAt - run.StartedAt)?.TotalMilliseconds ?? 0
        };

    private static ReplenishmentRecommendationDto MapRecommendation(
        ReplenishmentRecommendation r, List<ReplenishmentInput> inputs)
    {
        var input = inputs.FirstOrDefault(i =>
            i.ProductId == r.ProductId &&
            i.WarehouseId == r.WarehouseId &&
            i.SiteId == r.SiteId);

        return new ReplenishmentRecommendationDto
        {
            Id = r.Id,
            AutomationRunId = r.AutomationRunId,
            ProductId = r.ProductId,
            ProductName = input?.Product?.Name ?? string.Empty,
            ProductCode = input?.Product?.Code ?? string.Empty,
            WarehouseId = r.WarehouseId,
            WarehouseName = input?.Warehouse?.Name ?? string.Empty,
            SiteId = r.SiteId,
            SiteName = input?.Site?.Name ?? string.Empty,
            UnitOfMeasureId = r.UnitOfMeasureId,
            UnitOfMeasureName = input?.UnitOfMeasure?.Name ?? string.Empty,
            OnHandQuantity = r.OnHandQuantity,
            ReservedQuantity = r.ReservedQuantity,
            ConfirmedIncomingQuantity = r.ConfirmedIncomingQuantity,
            ExistingOpenRequestQuantity = r.ExistingOpenRequestQuantity,
            EffectiveStock = r.EffectiveStock,
            AverageDailyConsumption = r.AverageDailyConsumption,
            ReorderPoint = r.ReorderPoint,
            MinimumStock = r.MinimumStock,
            MaximumStock = r.MaximumStock,
            OrderingMethod = r.OrderingMethod,
            OrderingMethodName = r.OrderingMethod.HasValue
                ? PersianNames.OrderingMethod(r.OrderingMethod.Value)
                : null,
            SuggestedQuantity = r.SuggestedQuantity,
            RequestedQuantity = r.SuggestedQuantity,
            RequestClassificationId = r.RequestClassificationId,
            Reason = r.Reason,
            ReasonCode = r.ReasonCode,
            Status = r.Status,
            StatusName = PersianNames.RecommendationStatus(r.Status),
            IsSelectable = r.Status is RecommendationStatus.NeedsOrder or RecommendationStatus.NeedsReview
                           && r.SuggestedQuantity > 0,
            PurchaseRequestId = r.PurchaseRequestId
        };
    }
}
