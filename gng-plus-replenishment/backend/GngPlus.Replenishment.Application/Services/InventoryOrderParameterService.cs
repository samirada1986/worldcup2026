using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Entities;

namespace GngPlus.Replenishment.Application.Services;

/// <summary>سرویس مدیریت پارامترهای سفارش‌دهی کالا — اعتبارسنجی کسب‌وکار در همین لایه انجام می‌شود</summary>
public class InventoryOrderParameterService : IInventoryOrderParameterService
{
    private readonly IInventoryOrderParameterRepository _repository;
    private readonly ILookupRepository _lookups;

    public InventoryOrderParameterService(
        IInventoryOrderParameterRepository repository, ILookupRepository lookups)
    {
        _repository = repository;
        _lookups = lookups;
    }

    public async Task<List<InventoryOrderParameterDto>> QueryAsync(
        ParameterQueryDto query, CancellationToken ct = default)
    {
        var items = await _repository.QueryAsync(query, ct);
        var classifications = await _lookups.GetRequestClassificationsAsync(ct);
        var qcParameters = await _lookups.GetQualityControlParametersAsync(ct);
        var testPlans = await _lookups.GetTestPlansAsync(ct);

        return items.Select(i => Map(i, classifications, qcParameters, testPlans)).ToList();
    }

    public async Task<InventoryOrderParameterDto> GetAsync(int id, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdAsync(id, ct)
                     ?? throw new BusinessRuleException(ResultCodes.NotFound,
                         $"پارامتر سفارش‌دهی با شناسه {id} یافت نشد.");

        var classifications = await _lookups.GetRequestClassificationsAsync(ct);
        var qcParameters = await _lookups.GetQualityControlParametersAsync(ct);
        var testPlans = await _lookups.GetTestPlansAsync(ct);

        return Map(entity, classifications, qcParameters, testPlans);
    }

    public async Task<InventoryOrderParameterDto> CreateAsync(
        InventoryOrderParameterUpsertDto dto, CancellationToken ct = default)
    {
        await ValidateAsync(dto, null, ct);

        var entity = new InventoryOrderParameter { CreatedAt = DateTime.UtcNow };
        Apply(dto, entity);

        await _repository.AddAsync(entity, ct);
        await _repository.SaveChangesAsync(ct);

        return await GetAsync(entity.Id, ct);
    }

    public async Task<InventoryOrderParameterDto> UpdateAsync(
        int id, InventoryOrderParameterUpsertDto dto, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdAsync(id, ct)
                     ?? throw new BusinessRuleException(ResultCodes.NotFound,
                         $"پارامتر سفارش‌دهی با شناسه {id} یافت نشد.");

        await ValidateAsync(dto, id, ct);

        Apply(dto, entity);
        entity.UpdatedAt = DateTime.UtcNow;

        _repository.Update(entity);
        await _repository.SaveChangesAsync(ct);

        return await GetAsync(entity.Id, ct);
    }

    public async Task<InventoryOrderParameterDto> ChangeStatusAsync(
        int id, bool isActive, CancellationToken ct = default)
    {
        var entity = await _repository.GetByIdAsync(id, ct)
                     ?? throw new BusinessRuleException(ResultCodes.NotFound,
                         $"پارامتر سفارش‌دهی با شناسه {id} یافت نشد.");

        entity.IsActive = isActive;
        entity.UpdatedAt = DateTime.UtcNow;

        _repository.Update(entity);
        await _repository.SaveChangesAsync(ct);

        return await GetAsync(entity.Id, ct);
    }

    // ------------------------------------------------------------------
    // اعتبارسنجی کسب‌وکار
    // ------------------------------------------------------------------

    private async Task ValidateAsync(
        InventoryOrderParameterUpsertDto dto, int? excludeId, CancellationToken ct)
    {
        var errors = new Dictionary<string, object?>();

        void Require(bool condition, string field, string message)
        {
            if (!condition) errors[field] = message;
        }

        Require(dto.ProductId > 0, nameof(dto.ProductId), "انتخاب کالا الزامی است.");
        Require(dto.WarehouseId > 0, nameof(dto.WarehouseId), "انتخاب انبار الزامی است.");
        Require(dto.SiteId > 0, nameof(dto.SiteId), "انتخاب سایت الزامی است.");
        Require(dto.ParameterScopeId > 0, nameof(dto.ParameterScopeId), "انتخاب محدوده پارامتر الزامی است.");
        Require(dto.UnitOfMeasureId > 0, nameof(dto.UnitOfMeasureId), "انتخاب واحد سنجش الزامی است.");
        Require(dto.RequestTypeId > 0, nameof(dto.RequestTypeId), "انتخاب نوع درخواست الزامی است.");
        Require(Enum.IsDefined(dto.OrderingMethod), nameof(dto.OrderingMethod), "نحوه سفارش‌دهی نامعتبر است.");

        NonNegative(dto.ReorderPoint, nameof(dto.ReorderPoint), "نقطه سفارش نمی‌تواند منفی باشد.");
        NonNegative(dto.MinimumStock, nameof(dto.MinimumStock), "حداقل موجودی نمی‌تواند منفی باشد.");
        NonNegative(dto.MaximumStock, nameof(dto.MaximumStock), "حداکثر موجودی نمی‌تواند منفی باشد.");
        NonNegative(dto.DesiredStockLevel, nameof(dto.DesiredStockLevel), "سطح مطلوب نمی‌تواند منفی باشد.");
        NonNegative(dto.SafetyStock, nameof(dto.SafetyStock), "مقدار ذخیره نمی‌تواند منفی باشد.");
        NonNegative(dto.MinimumOrderQuantity, nameof(dto.MinimumOrderQuantity), "مقدار حداقل سفارش نمی‌تواند منفی باشد.");
        NonNegative(dto.MaximumOrderQuantity, nameof(dto.MaximumOrderQuantity), "مقدار حداکثر سفارش نمی‌تواند منفی باشد.");
        NonNegative(dto.OrderBatchSize, nameof(dto.OrderBatchSize), "اندازه انباشته سفارش نمی‌تواند منفی باشد.");
        NonNegative(dto.EconomicOrderQuantity, nameof(dto.EconomicOrderQuantity), "مقدار بهینه سفارش نمی‌تواند منفی باشد.");

        NonNegativeDays(dto.LeadTimeDays, nameof(dto.LeadTimeDays), "زمان تقریبی تامین نمی‌تواند منفی باشد.");
        NonNegativeDays(dto.AverageConsumptionDays, nameof(dto.AverageConsumptionDays),
            "تعداد روز برای محاسبه میانگین مصرف نمی‌تواند منفی باشد.");
        NonNegativeDays(dto.MinimumCoverageDays, nameof(dto.MinimumCoverageDays),
            "تعداد روز برای پوشش حداقل موجودی نمی‌تواند منفی باشد.");
        NonNegativeDays(dto.SalesCoverageDays, nameof(dto.SalesCoverageDays),
            "تعداد روز برای پوشش فروش نمی‌تواند منفی باشد.");

        if (dto.MinimumStock.HasValue && dto.MaximumStock.HasValue &&
            dto.MaximumStock.Value < dto.MinimumStock.Value)
            errors[nameof(dto.MaximumStock)] = "حداکثر موجودی نمی‌تواند کمتر از حداقل موجودی باشد.";

        if (dto.MinimumOrderQuantity.HasValue && dto.MaximumOrderQuantity.HasValue &&
            dto.MaximumOrderQuantity.Value < dto.MinimumOrderQuantity.Value)
            errors[nameof(dto.MaximumOrderQuantity)] =
                "مقدار حداکثر سفارش نمی‌تواند کمتر از مقدار حداقل سفارش باشد.";

        if (dto.ValidTo.HasValue && dto.ValidTo.Value.Date < dto.ValidFrom.Date)
            errors[nameof(dto.ValidTo)] = "تاریخ پایان اعتبار نمی‌تواند پیش از تاریخ شروع اعتبار باشد.";

        if (dto.OrderingMethod == Domain.Enums.OrderingMethod.ConsumptionBased &&
            (!dto.LeadTimeDays.HasValue || dto.LeadTimeDays.Value <= 0))
            errors[nameof(dto.LeadTimeDays)] =
                "برای نحوه سفارش‌دهی «بر اساس مصرف»، زمان تقریبی تامین الزامی است.";

        if (dto.OrderingMethod == Domain.Enums.OrderingMethod.MinMax &&
            (!dto.MinimumStock.HasValue || !dto.MaximumStock.HasValue))
            errors[nameof(dto.MinimumStock)] =
                "برای نحوه سفارش‌دهی «حداقل/حداکثر»، هر دو مقدار حداقل و حداکثر موجودی الزامی است.";

        if (dto.OrderingMethod == Domain.Enums.OrderingMethod.DesiredLevel && !dto.DesiredStockLevel.HasValue)
            errors[nameof(dto.DesiredStockLevel)] =
                "برای نحوه سفارش‌دهی «سطح مطلوب»، مقدار سطح مطلوب الزامی است.";

        if (dto.OrderingMethod == Domain.Enums.OrderingMethod.ReorderPoint)
        {
            if (!dto.ReorderPoint.HasValue)
                errors[nameof(dto.ReorderPoint)] =
                    "برای نحوه سفارش‌دهی «نقطه سفارش»، مقدار نقطه سفارش الزامی است.";

            if (!dto.DesiredStockLevel.HasValue && !dto.MaximumStock.HasValue)
                errors[nameof(dto.DesiredStockLevel)] =
                    "برای نحوه سفارش‌دهی «نقطه سفارش»، «سطح مطلوب» یا «حداکثر موجودی» باید تعیین شود.";
        }

        if (errors.Count == 0 && dto.ProductId > 0 && dto.WarehouseId > 0 && dto.SiteId > 0)
        {
            var duplicate = await _repository.ExistsForBusinessKeyAsync(
                dto.ProductId, dto.WarehouseId, dto.SiteId, excludeId, ct);

            if (duplicate)
                errors["businessKey"] =
                    "برای این ترکیب کالا، انبار و سایت پیش‌تر پارامتر سفارش‌دهی تعریف شده است.";
        }

        if (errors.Count > 0)
        {
            throw new BusinessRuleException(
                ResultCodes.InvalidReplenishmentParameter,
                errors.Values.OfType<string>().First(),
                errors);
        }

        void NonNegative(decimal? value, string field, string message)
        {
            if (value.HasValue && value.Value < 0) errors[field] = message;
        }

        void NonNegativeDays(int? value, string field, string message)
        {
            if (value.HasValue && value.Value < 0) errors[field] = message;
        }
    }

    private static void Apply(InventoryOrderParameterUpsertDto dto, InventoryOrderParameter entity)
    {
        entity.ProductId = dto.ProductId;
        entity.WarehouseId = dto.WarehouseId;
        entity.SiteId = dto.SiteId;
        entity.ParameterScopeId = dto.ParameterScopeId;
        entity.UnitOfMeasureId = dto.UnitOfMeasureId;
        entity.RequestTypeId = dto.RequestTypeId;
        entity.OrderingMethod = dto.OrderingMethod;
        entity.DefaultRequestClassificationId = dto.DefaultRequestClassificationId;
        entity.QualityControlParameterId = dto.QualityControlParameterId;
        entity.TestPlanId = dto.TestPlanId;
        entity.ReorderPoint = dto.ReorderPoint;
        entity.MinimumStock = dto.MinimumStock;
        entity.MaximumStock = dto.MaximumStock;
        entity.DesiredStockLevel = dto.DesiredStockLevel;
        entity.SafetyStock = dto.SafetyStock;
        entity.SpecialValueCoefficient = dto.SpecialValueCoefficient;
        entity.AverageConsumptionDays = dto.AverageConsumptionDays;
        entity.MinimumCoverageDays = dto.MinimumCoverageDays;
        entity.SalesCoverageDays = dto.SalesCoverageDays;
        entity.MinimumOrderQuantity = dto.MinimumOrderQuantity;
        entity.MaximumOrderQuantity = dto.MaximumOrderQuantity;
        entity.OrderBatchSize = dto.OrderBatchSize;
        entity.EconomicOrderQuantity = dto.EconomicOrderQuantity;
        entity.LeadTimeDays = dto.LeadTimeDays;
        entity.ValidFrom = dto.ValidFrom == default ? DateTime.UtcNow.Date : dto.ValidFrom;
        entity.ValidTo = dto.ValidTo;
        entity.IsActive = dto.IsActive;
    }

    private static InventoryOrderParameterDto Map(
        InventoryOrderParameter e,
        List<LookupItemDto> classifications,
        List<LookupItemDto> qcParameters,
        List<LookupItemDto> testPlans)
        => new()
        {
            Id = e.Id,
            ProductId = e.ProductId,
            ProductName = e.Product?.Name,
            ProductCode = e.Product?.Code,
            WarehouseId = e.WarehouseId,
            WarehouseName = e.Warehouse?.Name,
            SiteId = e.SiteId,
            SiteName = e.Site?.Name,
            ParameterScopeId = e.ParameterScopeId,
            ParameterScopeName = e.ParameterScope?.Name,
            UnitOfMeasureId = e.UnitOfMeasureId,
            UnitOfMeasureName = e.UnitOfMeasure?.Name,
            RequestTypeId = e.RequestTypeId,
            RequestTypeName = e.RequestType?.Name,
            OrderingMethod = e.OrderingMethod,
            OrderingMethodName = PersianNames.OrderingMethod(e.OrderingMethod),
            DefaultRequestClassificationId = e.DefaultRequestClassificationId,
            DefaultRequestClassificationName = classifications
                .FirstOrDefault(c => c.Id == e.DefaultRequestClassificationId)?.Name,
            QualityControlParameterId = e.QualityControlParameterId,
            QualityControlParameterName = qcParameters
                .FirstOrDefault(c => c.Id == e.QualityControlParameterId)?.Name,
            TestPlanId = e.TestPlanId,
            TestPlanName = testPlans.FirstOrDefault(c => c.Id == e.TestPlanId)?.Name,
            ReorderPoint = e.ReorderPoint,
            MinimumStock = e.MinimumStock,
            MaximumStock = e.MaximumStock,
            DesiredStockLevel = e.DesiredStockLevel,
            SafetyStock = e.SafetyStock,
            SpecialValueCoefficient = e.SpecialValueCoefficient,
            AverageConsumptionDays = e.AverageConsumptionDays,
            MinimumCoverageDays = e.MinimumCoverageDays,
            SalesCoverageDays = e.SalesCoverageDays,
            MinimumOrderQuantity = e.MinimumOrderQuantity,
            MaximumOrderQuantity = e.MaximumOrderQuantity,
            OrderBatchSize = e.OrderBatchSize,
            EconomicOrderQuantity = e.EconomicOrderQuantity,
            LeadTimeDays = e.LeadTimeDays,
            ValidFrom = e.ValidFrom,
            ValidTo = e.ValidTo,
            IsActive = e.IsActive
        };
}
