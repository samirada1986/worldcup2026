using System.Globalization;
using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Application.Services;

/// <summary>
/// سرویس درخواست خرید.
/// در نسخه ۱ اتوماسیون فقط «پیش‌نویس» می‌سازد و ارسال به گردش‌کار اقدام صریح کاربر است.
/// </summary>
public class PurchaseRequestService : IPurchaseRequestService
{
    private static readonly CultureInfo Inv = CultureInfo.InvariantCulture;

    private readonly IPurchaseRequestRepository _requests;
    private readonly IAutomationRepository _automation;
    private readonly ILookupRepository _lookups;
    private readonly IWorkflowService _workflow;

    public PurchaseRequestService(
        IPurchaseRequestRepository requests,
        IAutomationRepository automation,
        ILookupRepository lookups,
        IWorkflowService workflow)
    {
        _requests = requests;
        _automation = automation;
        _lookups = lookups;
        _workflow = workflow;
    }

    private static string N(decimal value) => value.ToString("0.##", Inv);

    // ------------------------------------------------------------------
    // ایجاد پیش‌نویس
    // ------------------------------------------------------------------

    public async Task<PurchaseRequestDto> CreateDraftAsync(
        CreateDraftPurchaseRequestDto dto, string createdBy, CancellationToken ct = default)
    {
        if (dto.Lines is null || dto.Lines.Count == 0)
            throw new BusinessRuleException(ResultCodes.NoValidRecommendations,
                "هیچ ردیفی برای ایجاد درخواست خرید انتخاب نشده است.");

        // ۱. یکتاسازی عملیات — فراخوانی تکراری با همان کلید، درخواست جدید نمی‌سازد
        if (!string.IsNullOrWhiteSpace(dto.IdempotencyKey))
        {
            var existing = await _requests.GetByIdempotencyKeyAsync(dto.IdempotencyKey!, ct);
            if (existing is not null)
            {
                var existingDto = await MapAsync(existing, ct);
                existingDto.IsExisting = true;
                return existingDto;
            }
        }

        var recommendationIds = dto.Lines.Select(l => l.RecommendationId).Distinct().ToList();
        var recommendations = await _automation.GetRecommendationsByIdsAsync(recommendationIds, ct);

        var missing = recommendationIds.Except(recommendations.Select(r => r.Id)).ToList();
        if (missing.Count > 0)
            throw new BusinessRuleException(ResultCodes.NotFound,
                "برخی از پیشنهادهای انتخاب‌شده یافت نشدند.",
                new Dictionary<string, object?> { ["recommendationIds"] = missing });

        // ۲. کلیدهای کسب‌وکاری که هم‌اکنون درخواست خرید باز دارند
        var openKeys = await _requests.GetOpenBusinessKeysAsync(ct);

        var acceptedLines = new List<(ReplenishmentRecommendation Rec, DraftPurchaseRequestLineDto Line)>();
        var skipped = new List<SkippedLineDto>();
        var auditEntries = new List<AutomationAuditLog>();

        foreach (var line in dto.Lines)
        {
            var rec = recommendations.First(r => r.Id == line.RecommendationId);
            var label = rec.Product is null ? $"کالا {rec.ProductId}" : $"{rec.Product.Name} ({rec.Product.Code})";

            // ردیف باید قابل انتخاب باشد
            if (rec.Status is not (RecommendationStatus.NeedsOrder or RecommendationStatus.NeedsReview))
            {
                skipped.Add(new SkippedLineDto
                {
                    RecommendationId = rec.Id,
                    ProductId = rec.ProductId,
                    ProductName = label,
                    Code = ResultCodes.NoValidRecommendations,
                    Reason = $"وضعیت این ردیف «{PersianNames.RecommendationStatus(rec.Status)}» است و قابل ارسال نیست."
                });
                continue;
            }

            // پیشنهادی که قبلاً به پیش‌نویس تبدیل شده است — محافظت در برابر ارسال دوباره
            if (rec.PurchaseRequestId.HasValue)
            {
                skipped.Add(new SkippedLineDto
                {
                    RecommendationId = rec.Id,
                    ProductId = rec.ProductId,
                    ProductName = label,
                    Code = ResultCodes.DuplicateDraftPrevented,
                    Reason = "برای این پیشنهاد پیش‌تر درخواست خرید ایجاد شده است."
                });
                continue;
            }

            // کنترل خرید تکراری بر اساس کلید کسب‌وکار
            var key = new ReplenishmentBusinessKey(rec.ProductId, rec.WarehouseId, rec.SiteId);
            if (openKeys.Contains(key))
            {
                skipped.Add(new SkippedLineDto
                {
                    RecommendationId = rec.Id,
                    ProductId = rec.ProductId,
                    ProductName = label,
                    Code = ResultCodes.OpenRequestExists,
                    Reason = "برای این کالا در این انبار و سایت، درخواست خرید باز وجود دارد."
                });

                auditEntries.Add(new AutomationAuditLog
                {
                    AutomationRunId = rec.AutomationRunId,
                    ProductId = rec.ProductId,
                    WarehouseId = rec.WarehouseId,
                    EventType = AuditEventType.DuplicateRequestDetected,
                    Message = $"{label}: ایجاد پیش‌نویس به دلیل وجود درخواست خرید باز انجام نشد."
                });
                continue;
            }

            // مقدار درخواست باید مثبت باشد
            if (line.RequestedQuantity <= 0)
                throw new BusinessRuleException(ResultCodes.ValidationFailed,
                    $"مقدار درخواست برای «{label}» باید بزرگ‌تر از صفر باشد.",
                    new Dictionary<string, object?> { ["recommendationId"] = rec.Id });

            // انحراف بیش از آستانه، دلیل تغییر را الزامی می‌کند
            if (ReplenishmentCalculator.RequiresChangeReason(rec.SuggestedQuantity, line.RequestedQuantity) &&
                string.IsNullOrWhiteSpace(line.QuantityChangeReason))
            {
                throw new BusinessRuleException(ResultCodes.ChangeReasonRequired,
                    $"مقدار درخواست «{label}» بیش از {ReplenishmentCalculator.QuantityChangeThreshold * 100:0}٪ " +
                    $"با مقدار پیشنهادی ({N(rec.SuggestedQuantity)}) اختلاف دارد؛ ثبت «دلیل تغییر مقدار پیشنهادی» الزامی است.",
                    new Dictionary<string, object?>
                    {
                        ["recommendationId"] = rec.Id,
                        ["suggestedQuantity"] = rec.SuggestedQuantity,
                        ["requestedQuantity"] = line.RequestedQuantity
                    });
            }

            acceptedLines.Add((rec, line));
            openKeys.Add(key); // جلوگیری از تکرار در همان فراخوانی
        }

        if (acceptedLines.Count == 0)
            throw new BusinessRuleException(ResultCodes.NoValidRecommendations,
                "هیچ ردیف معتبری برای ایجاد پیش‌نویس درخواست خرید باقی نماند.",
                new Dictionary<string, object?> { ["skipped"] = skipped });

        // ۳. ساخت درخواست خرید
        var requestNumber = await _requests.GenerateRequestNumberAsync(ct);

        var request = new PurchaseRequest
        {
            RequestNumber = requestNumber,
            Status = PurchaseRequestStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = createdBy,
            Source = PurchaseRequestSource.Automation,
            AutomationRunId = dto.AutomationRunId > 0 ? dto.AutomationRunId : acceptedLines[0].Rec.AutomationRunId,
            IdempotencyKey = string.IsNullOrWhiteSpace(dto.IdempotencyKey) ? null : dto.IdempotencyKey,
            WorkflowStatus = WorkflowStatus.NotStarted
        };

        foreach (var (rec, line) in acceptedLines)
        {
            var label = rec.Product is null ? $"کالا {rec.ProductId}" : $"{rec.Product.Name} ({rec.Product.Code})";

            request.Items.Add(new PurchaseRequestItem
            {
                ProductId = rec.ProductId,
                WarehouseId = rec.WarehouseId,
                SiteId = rec.SiteId,
                RequestedQuantity = line.RequestedQuantity,
                SuggestedQuantity = rec.SuggestedQuantity,
                UnitOfMeasureId = rec.UnitOfMeasureId,
                RequestClassificationId = line.RequestClassificationId ?? rec.RequestClassificationId,
                ReplenishmentRecommendationId = rec.Id,
                QuantityChangeReason = string.IsNullOrWhiteSpace(line.QuantityChangeReason)
                    ? null
                    : line.QuantityChangeReason!.Trim()
            });

            rec.Status = RecommendationStatus.DraftCreated;

            if (line.RequestedQuantity != rec.SuggestedQuantity)
            {
                auditEntries.Add(new AutomationAuditLog
                {
                    AutomationRunId = rec.AutomationRunId,
                    ProductId = rec.ProductId,
                    WarehouseId = rec.WarehouseId,
                    EventType = AuditEventType.QuantityOverridden,
                    Message = $"{label}: مقدار درخواست توسط کاربر تغییر کرد." +
                              (string.IsNullOrWhiteSpace(line.QuantityChangeReason)
                                  ? string.Empty
                                  : $" دلیل: {line.QuantityChangeReason!.Trim()}"),
                    BeforeValue = N(rec.SuggestedQuantity),
                    AfterValue = N(line.RequestedQuantity)
                });
            }
        }

        await _requests.AddAsync(request, ct);
        await _requests.SaveChangesAsync(ct);

        // ۴. اتصال پیشنهادها به درخواست ایجادشده و ثبت تاریخچه
        foreach (var (rec, _) in acceptedLines)
        {
            rec.PurchaseRequestId = request.Id;

            var label = rec.Product is null ? $"کالا {rec.ProductId}" : $"{rec.Product.Name} ({rec.Product.Code})";
            auditEntries.Add(new AutomationAuditLog
            {
                AutomationRunId = rec.AutomationRunId,
                ProductId = rec.ProductId,
                WarehouseId = rec.WarehouseId,
                EventType = AuditEventType.DraftRequestCreated,
                Message = $"{label}: در پیش‌نویس درخواست خرید {request.RequestNumber} ثبت شد.",
                AfterValue = request.RequestNumber
            });
        }

        foreach (var entry in auditEntries)
        {
            var run = await _automation.GetRunAsync(entry.AutomationRunId, ct);
            run?.AuditLogs.Add(entry);
        }

        await _automation.SaveChangesAsync(ct);

        var result = await MapAsync(request, ct);
        result.SkippedLines = skipped;
        return result;
    }

    // ------------------------------------------------------------------
    // خواندن
    // ------------------------------------------------------------------

    public async Task<PurchaseRequestDto> GetAsync(int id, CancellationToken ct = default)
    {
        var request = await _requests.GetByIdAsync(id, ct)
                      ?? throw new BusinessRuleException(ResultCodes.NotFound,
                          $"درخواست خرید با شناسه {id} یافت نشد.");
        return await MapAsync(request, ct);
    }

    public async Task<List<PurchaseRequestDto>> GetAllAsync(CancellationToken ct = default)
    {
        var requests = await _requests.GetAllAsync(ct);
        var result = new List<PurchaseRequestDto>();
        foreach (var request in requests)
            result.Add(await MapAsync(request, ct));
        return result;
    }

    // ------------------------------------------------------------------
    // ارسال به گردش‌کار
    // ------------------------------------------------------------------

    public async Task<PurchaseRequestDto> SubmitAsync(int id, string submittedBy, CancellationToken ct = default)
    {
        var request = await _requests.GetByIdAsync(id, ct)
                      ?? throw new BusinessRuleException(ResultCodes.NotFound,
                          $"درخواست خرید با شناسه {id} یافت نشد.");

        if (request.Status != PurchaseRequestStatus.Draft)
            throw new BusinessRuleException(ResultCodes.InvalidStatusTransition,
                $"تنها درخواست خرید در وضعیت «پیش‌نویس» قابل ارسال به گردش‌کار است. " +
                $"وضعیت فعلی: «{PersianNames.PurchaseRequestStatus(request.Status)}».");

        var instance = await _workflow.StartWorkflowAsync(request, ct);

        request.Status = PurchaseRequestStatus.Submitted;
        request.SubmittedAt = DateTime.UtcNow;
        request.WorkflowStatus = instance.Status;
        request.WorkflowInstanceId = instance.InstanceKey;

        await _requests.SaveChangesAsync(ct);

        if (request.AutomationRunId.HasValue)
        {
            var run = await _automation.GetRunAsync(request.AutomationRunId.Value, ct);
            run?.AuditLogs.Add(new AutomationAuditLog
            {
                AutomationRunId = request.AutomationRunId.Value,
                EventType = AuditEventType.RequestSubmitted,
                Message = $"درخواست خرید {request.RequestNumber} توسط «{submittedBy}» به گردش‌کار ارسال شد " +
                          $"(شناسه گردش‌کار: {instance.InstanceKey}).",
                BeforeValue = PersianNames.PurchaseRequestStatus(PurchaseRequestStatus.Draft),
                AfterValue = PersianNames.PurchaseRequestStatus(PurchaseRequestStatus.Submitted)
            });
            await _automation.SaveChangesAsync(ct);
        }

        return await MapAsync(request, ct);
    }

    // ------------------------------------------------------------------
    // نگاشت
    // ------------------------------------------------------------------

    private async Task<PurchaseRequestDto> MapAsync(PurchaseRequest request, CancellationToken ct)
    {
        var classifications = await _lookups.GetRequestClassificationsAsync(ct);

        return new PurchaseRequestDto
        {
            Id = request.Id,
            RequestNumber = request.RequestNumber,
            Status = request.Status,
            StatusName = PersianNames.PurchaseRequestStatus(request.Status),
            CreatedAt = request.CreatedAt,
            SubmittedAt = request.SubmittedAt,
            CreatedBy = request.CreatedBy,
            Source = request.Source,
            SourceName = PersianNames.PurchaseRequestSource(request.Source),
            AutomationRunId = request.AutomationRunId,
            WorkflowStatus = request.WorkflowStatus,
            WorkflowStatusName = PersianNames.WorkflowStatus(request.WorkflowStatus),
            WorkflowInstanceId = request.WorkflowInstanceId,
            Items = request.Items.Select(i => new PurchaseRequestItemDto
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? string.Empty,
                ProductCode = i.Product?.Code ?? string.Empty,
                WarehouseId = i.WarehouseId,
                WarehouseName = i.Warehouse?.Name ?? string.Empty,
                SiteId = i.SiteId,
                SiteName = i.Site?.Name ?? string.Empty,
                RequestedQuantity = i.RequestedQuantity,
                SuggestedQuantity = i.SuggestedQuantity,
                UnitOfMeasureId = i.UnitOfMeasureId,
                UnitOfMeasureName = i.UnitOfMeasure?.Name ?? string.Empty,
                RequestClassificationId = i.RequestClassificationId,
                RequestClassificationName = classifications
                    .FirstOrDefault(c => c.Id == i.RequestClassificationId)?.Name,
                QuantityChangeReason = i.QuantityChangeReason
            }).ToList()
        };
    }
}
