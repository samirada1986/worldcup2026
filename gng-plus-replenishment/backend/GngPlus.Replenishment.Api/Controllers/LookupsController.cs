using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GngPlus.Replenishment.Api.Controllers;

/// <summary>لیست‌های انتخابی صفحات</summary>
[ApiController]
[Route("api/lookups")]
[Produces("application/json")]
public class LookupsController : ControllerBase
{
    private readonly ILookupService _service;

    public LookupsController(ILookupService service) => _service = service;

    [HttpGet("products")]
    public async Task<ActionResult<ApiResponse<List<LookupItemDto>>>> Products(CancellationToken ct)
        => Ok(ApiResponse<List<LookupItemDto>>.Ok(await _service.GetProductsAsync(ct)));

    [HttpGet("warehouses")]
    public async Task<ActionResult<ApiResponse<List<LookupItemDto>>>> Warehouses(CancellationToken ct)
        => Ok(ApiResponse<List<LookupItemDto>>.Ok(await _service.GetWarehousesAsync(ct)));

    [HttpGet("sites")]
    public async Task<ActionResult<ApiResponse<List<LookupItemDto>>>> Sites(CancellationToken ct)
        => Ok(ApiResponse<List<LookupItemDto>>.Ok(await _service.GetSitesAsync(ct)));

    [HttpGet("product-groups")]
    public async Task<ActionResult<ApiResponse<List<LookupItemDto>>>> ProductGroups(CancellationToken ct)
        => Ok(ApiResponse<List<LookupItemDto>>.Ok(await _service.GetProductGroupsAsync(ct)));

    [HttpGet("product-natures")]
    public async Task<ActionResult<ApiResponse<List<LookupItemDto>>>> ProductNatures(CancellationToken ct)
        => Ok(ApiResponse<List<LookupItemDto>>.Ok(await _service.GetProductNaturesAsync(ct)));

    [HttpGet("units-of-measure")]
    public async Task<ActionResult<ApiResponse<List<LookupItemDto>>>> UnitsOfMeasure(CancellationToken ct)
        => Ok(ApiResponse<List<LookupItemDto>>.Ok(await _service.GetUnitsOfMeasureAsync(ct)));

    [HttpGet("parameter-scopes")]
    public async Task<ActionResult<ApiResponse<List<LookupItemDto>>>> ParameterScopes(CancellationToken ct)
        => Ok(ApiResponse<List<LookupItemDto>>.Ok(await _service.GetParameterScopesAsync(ct)));

    [HttpGet("request-types")]
    public async Task<ActionResult<ApiResponse<List<LookupItemDto>>>> RequestTypes(CancellationToken ct)
        => Ok(ApiResponse<List<LookupItemDto>>.Ok(await _service.GetRequestTypesAsync(ct)));

    [HttpGet("request-classifications")]
    public async Task<ActionResult<ApiResponse<List<LookupItemDto>>>> RequestClassifications(CancellationToken ct)
        => Ok(ApiResponse<List<LookupItemDto>>.Ok(await _service.GetRequestClassificationsAsync(ct)));

    [HttpGet("quality-control-parameters")]
    public async Task<ActionResult<ApiResponse<List<LookupItemDto>>>> QualityControlParameters(CancellationToken ct)
        => Ok(ApiResponse<List<LookupItemDto>>.Ok(await _service.GetQualityControlParametersAsync(ct)));

    [HttpGet("test-plans")]
    public async Task<ActionResult<ApiResponse<List<LookupItemDto>>>> TestPlans(CancellationToken ct)
        => Ok(ApiResponse<List<LookupItemDto>>.Ok(await _service.GetTestPlansAsync(ct)));

    [HttpGet("ordering-methods")]
    public ActionResult<ApiResponse<List<EnumItemDto>>> OrderingMethods()
        => Ok(ApiResponse<List<EnumItemDto>>.Ok(_service.GetOrderingMethods()));

    [HttpGet("comparison-parameters")]
    public ActionResult<ApiResponse<List<EnumItemDto>>> ComparisonParameters()
        => Ok(ApiResponse<List<EnumItemDto>>.Ok(_service.GetComparisonParameters()));

    [HttpGet("recommendation-statuses")]
    public ActionResult<ApiResponse<List<EnumItemDto>>> RecommendationStatuses()
        => Ok(ApiResponse<List<EnumItemDto>>.Ok(_service.GetRecommendationStatuses()));
}
