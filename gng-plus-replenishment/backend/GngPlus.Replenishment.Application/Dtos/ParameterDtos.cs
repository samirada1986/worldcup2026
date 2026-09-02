using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Application.Dtos;

/// <summary>پارامتر سفارش‌دهی کالا — خروجی</summary>
public class InventoryOrderParameterDto
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public string? ProductName { get; set; }
    public string? ProductCode { get; set; }

    public int WarehouseId { get; set; }
    public string? WarehouseName { get; set; }

    public int SiteId { get; set; }
    public string? SiteName { get; set; }

    public int ParameterScopeId { get; set; }
    public string? ParameterScopeName { get; set; }

    public int UnitOfMeasureId { get; set; }
    public string? UnitOfMeasureName { get; set; }

    public int RequestTypeId { get; set; }
    public string? RequestTypeName { get; set; }

    public OrderingMethod OrderingMethod { get; set; }
    public string? OrderingMethodName { get; set; }

    public int? DefaultRequestClassificationId { get; set; }
    public string? DefaultRequestClassificationName { get; set; }

    public int? QualityControlParameterId { get; set; }
    public string? QualityControlParameterName { get; set; }

    public int? TestPlanId { get; set; }
    public string? TestPlanName { get; set; }

    public decimal? ReorderPoint { get; set; }
    public decimal? MinimumStock { get; set; }
    public decimal? MaximumStock { get; set; }
    public decimal? DesiredStockLevel { get; set; }
    public decimal? SafetyStock { get; set; }
    public decimal? SpecialValueCoefficient { get; set; }
    public int? AverageConsumptionDays { get; set; }
    public int? MinimumCoverageDays { get; set; }
    public int? SalesCoverageDays { get; set; }
    public decimal? MinimumOrderQuantity { get; set; }
    public decimal? MaximumOrderQuantity { get; set; }
    public decimal? OrderBatchSize { get; set; }
    public decimal? EconomicOrderQuantity { get; set; }
    public int? LeadTimeDays { get; set; }

    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>ورودی ایجاد/ویرایش پارامتر سفارش‌دهی کالا</summary>
public class InventoryOrderParameterUpsertDto
{
    public int ProductId { get; set; }
    public int WarehouseId { get; set; }
    public int SiteId { get; set; }
    public int ParameterScopeId { get; set; }
    public int UnitOfMeasureId { get; set; }
    public int RequestTypeId { get; set; }
    public OrderingMethod OrderingMethod { get; set; }
    public int? DefaultRequestClassificationId { get; set; }
    public int? QualityControlParameterId { get; set; }
    public int? TestPlanId { get; set; }

    public decimal? ReorderPoint { get; set; }
    public decimal? MinimumStock { get; set; }
    public decimal? MaximumStock { get; set; }
    public decimal? DesiredStockLevel { get; set; }
    public decimal? SafetyStock { get; set; }
    public decimal? SpecialValueCoefficient { get; set; }
    public int? AverageConsumptionDays { get; set; }
    public int? MinimumCoverageDays { get; set; }
    public int? SalesCoverageDays { get; set; }
    public decimal? MinimumOrderQuantity { get; set; }
    public decimal? MaximumOrderQuantity { get; set; }
    public decimal? OrderBatchSize { get; set; }
    public decimal? EconomicOrderQuantity { get; set; }
    public int? LeadTimeDays { get; set; }

    public DateTime ValidFrom { get; set; }
    public DateTime? ValidTo { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>تغییر وضعیت فعال/غیرفعال پارامتر</summary>
public class ChangeStatusDto
{
    public bool IsActive { get; set; }
}

/// <summary>فیلتر فهرست پارامترها</summary>
public class ParameterQueryDto
{
    public int? ProductId { get; set; }
    public int? WarehouseId { get; set; }
    public int? SiteId { get; set; }
    public bool? IsActive { get; set; }
    public string? Search { get; set; }
}
