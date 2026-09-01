using GngPlus.Replenishment.Domain.Entities;

namespace GngPlus.Replenishment.Application.Common;

/// <summary>
/// بسته ورودی محاسبه برای یک ترکیب «کالا + انبار + سایت».
/// لایه داده این ساختار را می‌سازد و موتور محاسبه فقط روی آن کار می‌کند،
/// بنابراین منطق کسب‌وکار کاملاً قابل تست و مستقل از پایگاه داده است.
/// </summary>
public class ReplenishmentInput
{
    /// <summary>شناسه‌های کلید کسب‌وکار — همیشه مقدار دارند حتی اگر پارامتری تعریف نشده باشد</summary>
    public int ProductId { get; init; }
    public int WarehouseId { get; init; }
    public int SiteId { get; init; }

    /// <summary>
    /// پارامتر سفارش‌دهی. اگر برای این کلید کسب‌وکار پارامتری تعریف نشده باشد،
    /// مقدار آن خالی است و در ارزیابی، «خطای تنظیمات» ثبت می‌شود.
    /// </summary>
    public InventoryOrderParameter? Parameter { get; init; }

    public Product? Product { get; init; }
    public Warehouse? Warehouse { get; init; }
    public Site? Site { get; init; }
    public UnitOfMeasure? UnitOfMeasure { get; init; }

    /// <summary>آیا برای این کلید کسب‌وکار تصویر موجودی وجود دارد</summary>
    public bool HasInventorySnapshot { get; init; }

    public decimal OnHandQuantity { get; init; }
    public decimal ReservedQuantity { get; init; }
    public decimal ConfirmedIncomingQuantity { get; init; }

    /// <summary>مجموع مصرف در پنجره تحلیل</summary>
    public decimal TotalConsumption { get; init; }

    /// <summary>تعداد روزهای پنجره تحلیل مصرف</summary>
    public int ConsumptionWindowDays { get; init; }

    /// <summary>آیا در پنجره تحلیل، رکورد مصرفی ثبت شده است</summary>
    public bool HasConsumptionHistory { get; init; }

    /// <summary>مجموع مقدار درخواست‌های خرید باز برای همین کلید کسب‌وکار</summary>
    public decimal OpenPurchaseRequestQuantity { get; init; }
}

/// <summary>کلید کسب‌وکار جلوگیری از خرید تکراری</summary>
public readonly record struct ReplenishmentBusinessKey(int ProductId, int WarehouseId, int SiteId);
