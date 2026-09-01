namespace GngPlus.Replenishment.Domain.Entities;

/// <summary>تصویر لحظه‌ای موجودی انبار</summary>
public class InventorySnapshot
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public int SiteId { get; set; }
    public Site? Site { get; set; }

    /// <summary>موجودی فعلی</summary>
    public decimal OnHandQuantity { get; set; }

    /// <summary>موجودی رزرو شده</summary>
    public decimal ReservedQuantity { get; set; }

    /// <summary>ورودی قطعی (سفارش خرید تایید شده و در راه)</summary>
    public decimal ConfirmedIncomingQuantity { get; set; }

    public DateTime SnapshotDate { get; set; }
}

/// <summary>تاریخچه مصرف کالا</summary>
public class ConsumptionHistory
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public DateTime Date { get; set; }
    public decimal Quantity { get; set; }
}
