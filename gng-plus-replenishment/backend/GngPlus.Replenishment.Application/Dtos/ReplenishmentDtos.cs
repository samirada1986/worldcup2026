using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Application.Dtos;

/// <summary>فیلتر صفحه «سفارش‌دهی کالا»</summary>
public class ReplenishmentFilterDto
{
    /// <summary>از تاریخ — ابتدای بازه تحلیل مصرف</summary>
    public DateTime? FromDate { get; set; }

    /// <summary>تا تاریخ — انتهای بازه تحلیل مصرف</summary>
    public DateTime? ToDate { get; set; }

    public int? ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public int? SiteId { get; set; }
    public int? ProductGroupId { get; set; }

    /// <summary>ماهیت کالا</summary>
    public int? ProductNatureId { get; set; }

    /// <summary>محدوده پارامتر</summary>
    public int? ParameterScopeId { get; set; }

    /// <summary>
    /// پارامتر مقایسه — پارامتری که موجودی موثر با آن سنجیده می‌شود.
    /// در صورت خالی بودن، پارامتر طبیعی هر «نحوه سفارش‌دهی» استفاده می‌شود.
    /// </summary>
    public ComparisonParameter? ComparisonParameter { get; set; }

    /// <summary>
    /// درصد مازاد موجودی به پارامتر مقایسه.
    /// فقط کالاهایی نمایش داده می‌شوند که موجودی موثر آن‌ها حداکثر
    /// (۱ + درصد/۱۰۰) برابر پارامتر مقایسه باشد.
    /// </summary>
    public decimal? SurplusPercentage { get; set; }

    /// <summary>نوع اجرای ثبت‌شده در تاریخچه</summary>
    public AutomationTriggerType TriggerType { get; set; } = AutomationTriggerType.Manual;
}

/// <summary>پارامتر مقایسه موجودی</summary>
public enum ComparisonParameter
{
    /// <summary>نقطه سفارش</summary>
    ReorderPoint = 1,

    /// <summary>حداقل موجودی</summary>
    MinimumStock = 2,

    /// <summary>حداکثر موجودی</summary>
    MaximumStock = 3,

    /// <summary>سطح مطلوب</summary>
    DesiredStockLevel = 4
}

/// <summary>یک ردیف نتیجه در گرید «سفارش‌دهی کالا»</summary>
public class ReplenishmentRecommendationDto
{
    public int Id { get; set; }
    public int AutomationRunId { get; set; }

    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;

    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;

    public int SiteId { get; set; }
    public string SiteName { get; set; } = string.Empty;

    public int UnitOfMeasureId { get; set; }
    public string UnitOfMeasureName { get; set; } = string.Empty;

    /// <summary>موجودی فعلی</summary>
    public decimal OnHandQuantity { get; set; }

    /// <summary>موجودی رزرو شده</summary>
    public decimal ReservedQuantity { get; set; }

    /// <summary>ورودی قطعی</summary>
    public decimal ConfirmedIncomingQuantity { get; set; }

    /// <summary>مقدار درخواست خرید باز</summary>
    public decimal ExistingOpenRequestQuantity { get; set; }

    /// <summary>موجودی موثر</summary>
    public decimal EffectiveStock { get; set; }

    /// <summary>میانگین مصرف روزانه</summary>
    public decimal AverageDailyConsumption { get; set; }

    public decimal? ReorderPoint { get; set; }
    public decimal? MinimumStock { get; set; }
    public decimal? MaximumStock { get; set; }

    public OrderingMethod? OrderingMethod { get; set; }
    public string? OrderingMethodName { get; set; }

    /// <summary>مقدار پیشنهادی سفارش</summary>
    public decimal SuggestedQuantity { get; set; }

    /// <summary>مقدار درخواست — مقدار اولیه برابر پیشنهاد و قابل ویرایش در گرید</summary>
    public decimal RequestedQuantity { get; set; }

    public int? RequestClassificationId { get; set; }
    public string? RequestClassificationName { get; set; }

    /// <summary>دلیل پیشنهاد</summary>
    public string Reason { get; set; } = string.Empty;
    public string ReasonCode { get; set; } = string.Empty;

    public RecommendationStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;

    /// <summary>آیا این ردیف قابل انتخاب برای ایجاد درخواست خرید است</summary>
    public bool IsSelectable { get; set; }

    public int? PurchaseRequestId { get; set; }
    public string? PurchaseRequestNumber { get; set; }
}

/// <summary>خلاصه نتیجه یک محاسبه/اجرا</summary>
public class ReplenishmentSummaryDto
{
    public int AutomationRunId { get; set; }
    public DateTime StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public AutomationTriggerType TriggerType { get; set; }
    public string TriggerTypeName { get; set; } = string.Empty;
    public AutomationRunStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;

    /// <summary>تعداد کالاهای بررسی‌شده</summary>
    public int TotalItems { get; set; }

    /// <summary>تعداد پیشنهادهای ایجادشده</summary>
    public int RecommendedItems { get; set; }

    /// <summary>تعداد موارد نیازمند بررسی</summary>
    public int ReviewItems { get; set; }

    /// <summary>تعداد موارد Skip شده (بدون نیاز / درخواست باز)</summary>
    public int SkippedItems { get; set; }

    /// <summary>تعداد خطاها</summary>
    public int ErrorItems { get; set; }

    /// <summary>مدت اجرا بر حسب میلی‌ثانیه</summary>
    public double DurationMs { get; set; }
}

/// <summary>پاسخ محاسبه نیاز سفارش</summary>
public class ReplenishmentResultDto
{
    public ReplenishmentSummaryDto Summary { get; set; } = new();
    public List<ReplenishmentRecommendationDto> Recommendations { get; set; } = new();
}
