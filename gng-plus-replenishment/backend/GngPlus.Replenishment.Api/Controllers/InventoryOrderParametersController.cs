using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GngPlus.Replenishment.Api.Controllers;

/// <summary>پارامترهای سفارش‌دهی کالا</summary>
[ApiController]
[Route("api/inventory-order-parameters")]
[Produces("application/json")]
public class InventoryOrderParametersController : ControllerBase
{
    private readonly IInventoryOrderParameterService _service;

    public InventoryOrderParametersController(IInventoryOrderParameterService service)
        => _service = service;

    /// <summary>فهرست پارامترهای سفارش‌دهی</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<InventoryOrderParameterDto>>>> Query(
        [FromQuery] ParameterQueryDto query, CancellationToken ct)
        => Ok(ApiResponse<List<InventoryOrderParameterDto>>.Ok(await _service.QueryAsync(query, ct)));

    /// <summary>خواندن یک پارامتر</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<InventoryOrderParameterDto>>> Get(int id, CancellationToken ct)
        => Ok(ApiResponse<InventoryOrderParameterDto>.Ok(await _service.GetAsync(id, ct)));

    /// <summary>ایجاد پارامتر جدید</summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<InventoryOrderParameterDto>>> Create(
        [FromBody] InventoryOrderParameterUpsertDto dto, CancellationToken ct)
    {
        var created = await _service.CreateAsync(dto, ct);
        return CreatedAtAction(nameof(Get), new { id = created.Id },
            ApiResponse<InventoryOrderParameterDto>.Ok(created));
    }

    /// <summary>ویرایش پارامتر</summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ApiResponse<InventoryOrderParameterDto>>> Update(
        int id, [FromBody] InventoryOrderParameterUpsertDto dto, CancellationToken ct)
        => Ok(ApiResponse<InventoryOrderParameterDto>.Ok(await _service.UpdateAsync(id, dto, ct)));

    /// <summary>فعال/غیرفعال کردن پارامتر</summary>
    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<ApiResponse<InventoryOrderParameterDto>>> ChangeStatus(
        int id, [FromBody] ChangeStatusDto dto, CancellationToken ct)
        => Ok(ApiResponse<InventoryOrderParameterDto>.Ok(await _service.ChangeStatusAsync(id, dto.IsActive, ct)));
}
