using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Domain.Entities;

/// <summary>پارامترهای سفارش‌دهی کالا</summary>
public class InventoryOrderParameter
{
    public int Id { get; set; }

    // --- شناسه‌های پایه ---
    /// <summary>کالا</summary>
    public int ProductId { get; set; }
    public Product? Product { get; set; }

    /// <summary>انبار</summary>
    public int WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }

    /// <summary>سایت</summary>
    public int SiteId { get; set; }
    public Site? Site { get; set; }

    /// <summary>محدوده پارامتر</summary>
    public int ParameterScopeId { get; set; }
    public ParameterScope? ParameterScope { get; set; }

    /// <summary>واحد سنجش</summary>
    public int UnitOfMeasureId { get; set; }
    public UnitOfMeasure? UnitOfMeasure { get; set; }

    /// <summary>نوع درخواست</summary>
    public int RequestTypeId { get; set; }
    public RequestType? RequestType { get; set; }

    /// <summary>نحوه سفارش‌دهی</summary>
    public OrderingMethod OrderingMethod { get; set; }

    /// <summary>طبقه‌بندی پیش‌فرض</summary>
    public int? DefaultRequestClassificationId { get; set; }
    public RequestClassification? DefaultRequestClassification { get; set; }

    /// <summary>پارامتر کنترل کیفیت — در نمونه اولیه فقط نگهداری می‌شود</summary>
    public int? QualityControlParameterId { get; set; }
    public QualityControlParameter? QualityControlParameter { get; set; }

    /// <summary>طرح آزمایش — در نمونه اولیه فقط نگهداری می‌شود</summary>
    public int? TestPlanId { get; set; }
    public TestPlan? TestPlan { get; set; }

    // --- مقادیر عددی کسب‌وکار ---
    /// <summary>نقطه سفارش</summary>
    public decimal? ReorderPoint { get; set; }

    /// <summary>حداقل موجودی</summary>
    public decimal? MinimumStock { get; set; }

    /// <summary>حداکثر موجودی</summary>
    public decimal? MaximumStock { get; set; }

    /// <summary>سطح مطلوب</summary>
    public decimal? DesiredStockLevel { get; set; }

    /// <summary>مقدار ذخیره (ذخیره اطمینان)</summary>
    public decimal? SafetyStock { get; set; }

    /// <summary>ضریب ارزش ویژه</summary>
    public decimal? SpecialValueCoefficient { get; set; }

    /// <summary>تعداد روز برای محاسبه میانگین مصرف</summary>
    public int? AverageConsumptionDays { get; set; }

    /// <summary>تعداد روز برای پوشش حداقل موجودی</summary>
    public int? MinimumCoverageDays { get; set; }

    /// <summary>تعداد روز برای پوشش فروش</summary>
    public int? SalesCoverageDays { get; set; }

    /// <summary>مقدار حداقل سفارش</summary>
    public decimal? MinimumOrderQuantity { get; set; }

    /// <summary>مقدار حداکثر سفارش</summary>
    public decimal? MaximumOrderQuantity { get; set; }

    /// <summary>اندازه انباشته سفارش</summary>
    public decimal? OrderBatchSize { get; set; }

    /// <summary>مقدار بهینه سفارش</summary>
    public decimal? EconomicOrderQuantity { get; set; }

    /// <summary>زمان تقریبی تامین (روز)</summary>
    public int? LeadTimeDays { get; set; }

    // --- اعتبار ---
    /// <summary>تاریخ شروع اعتبار</summary>
    public DateTime ValidFrom { get; set; }

    /// <summary>تاریخ پایان اعتبار</summary>
    public DateTime? ValidTo { get; set; }

    /// <summary>فعال / غیرفعال</summary>
    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
