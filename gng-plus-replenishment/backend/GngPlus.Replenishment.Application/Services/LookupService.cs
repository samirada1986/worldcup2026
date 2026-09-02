using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Application.Services;

/// <summary>سرویس لیست‌های انتخابی صفحات</summary>
public class LookupService : ILookupService
{
    private readonly ILookupRepository _repository;

    public LookupService(ILookupRepository repository) => _repository = repository;

    public Task<List<LookupItemDto>> GetProductsAsync(CancellationToken ct = default)
        => _repository.GetProductsAsync(ct);

    public Task<List<LookupItemDto>> GetWarehousesAsync(CancellationToken ct = default)
        => _repository.GetWarehousesAsync(ct);

    public Task<List<LookupItemDto>> GetSitesAsync(CancellationToken ct = default)
        => _repository.GetSitesAsync(ct);

    public Task<List<LookupItemDto>> GetProductGroupsAsync(CancellationToken ct = default)
        => _repository.GetProductGroupsAsync(ct);

    public Task<List<LookupItemDto>> GetProductNaturesAsync(CancellationToken ct = default)
        => _repository.GetProductNaturesAsync(ct);

    public Task<List<LookupItemDto>> GetUnitsOfMeasureAsync(CancellationToken ct = default)
        => _repository.GetUnitsOfMeasureAsync(ct);

    public Task<List<LookupItemDto>> GetParameterScopesAsync(CancellationToken ct = default)
        => _repository.GetParameterScopesAsync(ct);

    public Task<List<LookupItemDto>> GetRequestTypesAsync(CancellationToken ct = default)
        => _repository.GetRequestTypesAsync(ct);

    public Task<List<LookupItemDto>> GetRequestClassificationsAsync(CancellationToken ct = default)
        => _repository.GetRequestClassificationsAsync(ct);

    public Task<List<LookupItemDto>> GetQualityControlParametersAsync(CancellationToken ct = default)
        => _repository.GetQualityControlParametersAsync(ct);

    public Task<List<LookupItemDto>> GetTestPlansAsync(CancellationToken ct = default)
        => _repository.GetTestPlansAsync(ct);

    public List<EnumItemDto> GetOrderingMethods()
        => PersianNames.ToList<OrderingMethod>(PersianNames.OrderingMethod);

    public List<EnumItemDto> GetComparisonParameters()
        => PersianNames.ToList<ComparisonParameter>(PersianNames.ComparisonParameter);

    public List<EnumItemDto> GetRecommendationStatuses()
        => PersianNames.ToList<RecommendationStatus>(PersianNames.RecommendationStatus);
}
