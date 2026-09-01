using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Application.Services;

/// <summary>
/// سرویس اتوماسیون سفارش‌دهی.
/// زمان‌بندی در نمونه اولیه شبیه‌سازی می‌شود و اجرای واقعی از طریق API انجام می‌گیرد.
/// </summary>
public class AutomationService : IAutomationService
{
    private readonly IAutomationRepository _automation;
    private readonly IReplenishmentService _replenishment;
    private readonly ILookupRepository _lookups;

    public AutomationService(
        IAutomationRepository automation,
        IReplenishmentService replenishment,
        ILookupRepository lookups)
    {
        _automation = automation;
        _replenishment = replenishment;
        _lookups = lookups;
    }

    public async Task<AutomationStatusDto> GetStatusAsync(CancellationToken ct = default)
    {
        var settings = await _automation.GetSettingsAsync(ct);
        var dto = MapSettings(settings);

        if (settings.LastRunId.HasValue)
        {
            var run = await _automation.GetRunAsync(settings.LastRunId.Value, ct);
            if (run is not null)
                dto.LastRunSummary = ReplenishmentService.MapSummary(run, 0);
        }

        return dto;
    }

    public async Task<AutomationStatusDto> UpdateSettingsAsync(
        UpdateAutomationSettingsDto dto, CancellationToken ct = default)
    {
        if (dto.DailyRunHour is < 0 or > 23)
            throw new BusinessRuleException(ResultCodes.ValidationFailed,
                "ساعت اجرای روزانه باید بین ۰ تا ۲۳ باشد.");

        var settings = await _automation.GetSettingsAsync(ct);
        settings.IsEnabled = dto.IsEnabled;
        settings.TriggerType = dto.TriggerType;
        settings.DailyRunHour = dto.DailyRunHour;

        await _automation.SaveChangesAsync(ct);
        return await GetStatusAsync(ct);
    }

    public async Task<ReplenishmentResultDto> RunAsync(
        RunAutomationDto dto, string triggeredBy, CancellationToken ct = default)
    {
        var settings = await _automation.GetSettingsAsync(ct);

        if (!settings.IsEnabled)
            throw new BusinessRuleException(ResultCodes.ValidationFailed,
                "اتوماسیون سفارش‌دهی غیرفعال است و قابل اجرا نیست.");

        var filter = dto.Filter ?? new ReplenishmentFilterDto();
        filter.TriggerType = dto.TriggerType;

        var result = await _replenishment.CalculateAsync(filter, triggeredBy, ct);

        settings.LastRunAt = result.Summary.StartedAt;
        settings.LastRunId = result.Summary.AutomationRunId;
        await _automation.SaveChangesAsync(ct);

        return result;
    }

    public async Task<List<ReplenishmentSummaryDto>> GetRunsAsync(int take, CancellationToken ct = default)
    {
        var runs = await _automation.GetRunsAsync(take <= 0 ? 50 : take, ct);
        return runs.Select(r => ReplenishmentService.MapSummary(r, 0)).ToList();
    }

    public async Task<ReplenishmentResultDto> GetRunAsync(int id, CancellationToken ct = default)
    {
        var run = await _automation.GetRunAsync(id, ct)
                  ?? throw new BusinessRuleException(ResultCodes.NotFound,
                      $"اجرای اتوماسیون با شناسه {id} یافت نشد.");

        var recommendations = await _automation.GetRecommendationsAsync(id, ct);

        return new ReplenishmentResultDto
        {
            Summary = ReplenishmentService.MapSummary(run, 0),
            Recommendations = recommendations.Select(MapRecommendation).ToList()
        };
    }

    public async Task<List<AutomationAuditLogDto>> GetAuditAsync(int runId, CancellationToken ct = default)
    {
        var run = await _automation.GetRunAsync(runId, ct)
                  ?? throw new BusinessRuleException(ResultCodes.NotFound,
                      $"اجرای اتوماسیون با شناسه {runId} یافت نشد.");

        var logs = await _automation.GetAuditLogsAsync(run.Id, ct);
        var warehouses = await _lookups.GetWarehousesAsync(ct);

        return logs.Select(l => new AutomationAuditLogDto
        {
            Id = l.Id,
            AutomationRunId = l.AutomationRunId,
            ProductId = l.ProductId,
            ProductName = l.Product?.Name,
            ProductCode = l.Product?.Code,
            WarehouseId = l.WarehouseId,
            WarehouseName = warehouses.FirstOrDefault(w => w.Id == l.WarehouseId)?.Name,
            EventType = l.EventType,
            EventTypeName = PersianNames.AuditEventType(l.EventType),
            Message = l.Message,
            BeforeValue = l.BeforeValue,
            AfterValue = l.AfterValue,
            CreatedAt = l.CreatedAt
        }).ToList();
    }

    // ------------------------------------------------------------------

    private static AutomationStatusDto MapSettings(AutomationSettings settings)
    {
        DateTime? nextRun = null;

        if (settings.IsEnabled && settings.TriggerType == AutomationTriggerType.DailySchedule)
        {
            var now = DateTime.UtcNow;
            var candidate = new DateTime(now.Year, now.Month, now.Day, settings.DailyRunHour, 0, 0, DateTimeKind.Utc);
            nextRun = candidate > now ? candidate : candidate.AddDays(1);
        }

        return new AutomationStatusDto
        {
            IsEnabled = settings.IsEnabled,
            StatusName = settings.IsEnabled ? "فعال" : "غیرفعال",
            TriggerType = settings.TriggerType,
            TriggerTypeName = PersianNames.TriggerType(settings.TriggerType),
            DailyRunHour = settings.DailyRunHour,
            LastRunAt = settings.LastRunAt,
            LastRunId = settings.LastRunId,
            NextRunAt = nextRun
        };
    }

    private static ReplenishmentRecommendationDto MapRecommendation(ReplenishmentRecommendation r)
        => new()
        {
            Id = r.Id,
            AutomationRunId = r.AutomationRunId,
            ProductId = r.ProductId,
            ProductName = r.Product?.Name ?? string.Empty,
            ProductCode = r.Product?.Code ?? string.Empty,
            WarehouseId = r.WarehouseId,
            WarehouseName = r.Warehouse?.Name ?? string.Empty,
            SiteId = r.SiteId,
            SiteName = r.Site?.Name ?? string.Empty,
            UnitOfMeasureId = r.UnitOfMeasureId,
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
