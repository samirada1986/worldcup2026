using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Domain.Entities;

/// <summary>پیشنهاد سفارش تولیدشده توسط موتور محاسبه</summary>
public class ReplenishmentRecommendation
{
    public int Id { get; set; }

    public int AutomationRunId { get; set; }
    public AutomationRun? AutomationRun { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public int SiteId { get; set; }
    public Site? Site { get; set; }

    public int? InventoryOrderParameterId { get; set; }
    public int UnitOfMeasureId { get; set; }

    // --- مقادیر محاسبه‌شده ---
    /// <summary>موجودی فعلی</summary>
    public decimal OnHandQuantity { get; set; }

    /// <summary>موجودی رزرو شده</summary>
    public decimal ReservedQuantity { get; set; }

    /// <summary>ورودی قطعی</summary>
    public decimal ConfirmedIncomingQuantity { get; set; }

    /// <summary>مقدار درخواست‌های خرید باز برای همین کلید کسب‌وکار</summary>
    public decimal ExistingOpenRequestQuantity { get; set; }

    /// <summary>موجودی موثر</summary>
    public decimal EffectiveStock { get; set; }

    /// <summary>میانگین مصرف روزانه</summary>
    public decimal AverageDailyConsumption { get; set; }

    public decimal? ReorderPoint { get; set; }
    public decimal? MinimumStock { get; set; }
    public decimal? MaximumStock { get; set; }

    /// <summary>نحوه سفارش‌دهی به‌کاررفته</summary>
    public OrderingMethod? OrderingMethod { get; set; }

    /// <summary>مقدار پیشنهادی خام پیش از نرمال‌سازی</summary>
    public decimal RawSuggestedQuantity { get; set; }

    /// <summary>مقدار پیشنهادی نهایی پس از اعمال حداقل/حداکثر/انباشته</summary>
    public decimal SuggestedQuantity { get; set; }

    /// <summary>دلیل پیشنهاد — متن فارسی قابل نمایش در گرید</summary>
    public string Reason { get; set; } = string.Empty;

    /// <summary>کد ماشین‌خوان دلیل</summary>
    public string ReasonCode { get; set; } = string.Empty;

    public RecommendationStatus Status { get; set; }

    /// <summary>طبقه‌بندی پیش‌فرض درخواست</summary>
    public int? RequestClassificationId { get; set; }

    /// <summary>در صورت ایجاد پیش‌نویس، شناسه درخواست خرید مربوطه</summary>
    public int? PurchaseRequestId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>یک اجرای اتوماسیون سفارش‌دهی</summary>
public class AutomationRun
{
    public int Id { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime? FinishedAt { get; set; }
    public AutomationTriggerType TriggerType { get; set; }
    public AutomationRunStatus Status { get; set; } = AutomationRunStatus.Running;

    /// <summary>تعداد کالاهای بررسی‌شده</summary>
    public int TotalItems { get; set; }

    /// <summary>تعداد پیشنهادهای ایجادشده</summary>
    public int RecommendedItems { get; set; }

    /// <summary>تعداد موارد Skip شده</summary>
    public int SkippedItems { get; set; }

    /// <summary>تعداد خطاها</summary>
    public int ErrorItems { get; set; }

    /// <summary>تعداد موارد نیازمند بررسی</summary>
    public int ReviewItems { get; set; }

    public string TriggeredBy { get; set; } = string.Empty;

    public List<ReplenishmentRecommendation> Recommendations { get; set; } = new();
    public List<AutomationAuditLog> AuditLogs { get; set; } = new();
}

/// <summary>رویداد ثبت‌شده در تاریخچه اجرای اتوماسیون</summary>
public class AutomationAuditLog
{
    public int Id { get; set; }
    public int AutomationRunId { get; set; }
    public AutomationRun? AutomationRun { get; set; }

    public int? ProductId { get; set; }
    public Product? Product { get; set; }
    public int? WarehouseId { get; set; }

    public AuditEventType EventType { get; set; }

    /// <summary>شرح رویداد به فارسی</summary>
    public string Message { get; set; } = string.Empty;

    /// <summary>مقدار پیش از تغییر</summary>
    public string? BeforeValue { get; set; }

    /// <summary>مقدار پس از تغییر</summary>
    public string? AfterValue { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

/// <summary>تنظیمات اتوماسیون سفارش‌دهی</summary>
public class AutomationSettings
{
    public int Id { get; set; }

    /// <summary>وضعیت اتوماسیون — فعال/غیرفعال</summary>
    public bool IsEnabled { get; set; } = true;

    /// <summary>نوع اجرا</summary>
    public AutomationTriggerType TriggerType { get; set; } = AutomationTriggerType.Manual;

    /// <summary>ساعت اجرای زمان‌بندی روزانه (۰ تا ۲۳)</summary>
    public int DailyRunHour { get; set; } = 2;

    public DateTime? LastRunAt { get; set; }
    public int? LastRunId { get; set; }
}
