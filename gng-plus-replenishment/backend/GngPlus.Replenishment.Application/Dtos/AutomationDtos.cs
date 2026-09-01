using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Application.Dtos;

/// <summary>وضعیت پنل «اتوماسیون سفارش‌دهی»</summary>
public class AutomationStatusDto
{
    /// <summary>وضعیت اتوماسیون</summary>
    public bool IsEnabled { get; set; }
    public string StatusName { get; set; } = string.Empty;

    /// <summary>نوع اجرا</summary>
    public AutomationTriggerType TriggerType { get; set; }
    public string TriggerTypeName { get; set; } = string.Empty;

    /// <summary>ساعت اجرای روزانه</summary>
    public int DailyRunHour { get; set; }

    /// <summary>آخرین اجرا</summary>
    public DateTime? LastRunAt { get; set; }
    public int? LastRunId { get; set; }

    /// <summary>اجرای بعدی — در حالت دستی خالی است</summary>
    public DateTime? NextRunAt { get; set; }

    public ReplenishmentSummaryDto? LastRunSummary { get; set; }
}

/// <summary>ورودی تغییر تنظیمات اتوماسیون</summary>
public class UpdateAutomationSettingsDto
{
    public bool IsEnabled { get; set; }
    public AutomationTriggerType TriggerType { get; set; }
    public int DailyRunHour { get; set; }
}

/// <summary>ورودی اجرای اتوماسیون</summary>
public class RunAutomationDto
{
    public AutomationTriggerType TriggerType { get; set; } = AutomationTriggerType.Manual;
    public ReplenishmentFilterDto? Filter { get; set; }
}

/// <summary>یک رویداد تاریخچه اجرا</summary>
public class AutomationAuditLogDto
{
    public int Id { get; set; }
    public int AutomationRunId { get; set; }
    public int? ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? ProductCode { get; set; }
    public int? WarehouseId { get; set; }
    public string? WarehouseName { get; set; }
    public AuditEventType EventType { get; set; }
    public string EventTypeName { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string? BeforeValue { get; set; }
    public string? AfterValue { get; set; }
    public DateTime CreatedAt { get; set; }
}
