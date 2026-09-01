using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GngPlus.Replenishment.Api.Controllers;

/// <summary>اتوماسیون سفارش‌دهی و تاریخچه اجرا</summary>
[ApiController]
[Route("api/automation")]
[Produces("application/json")]
public class AutomationController : ControllerBase
{
    private readonly IAutomationService _service;

    public AutomationController(IAutomationService service) => _service = service;

    /// <summary>وضعیت اتوماسیون، آخرین اجرا و اجرای بعدی</summary>
    [HttpGet("replenishment/status")]
    public async Task<ActionResult<ApiResponse<AutomationStatusDto>>> Status(CancellationToken ct)
        => Ok(ApiResponse<AutomationStatusDto>.Ok(await _service.GetStatusAsync(ct)));

    /// <summary>تغییر تنظیمات اتوماسیون (نوع اجرا، ساعت اجرای روزانه، فعال بودن)</summary>
    [HttpPut("replenishment/settings")]
    public async Task<ActionResult<ApiResponse<AutomationStatusDto>>> UpdateSettings(
        [FromBody] UpdateAutomationSettingsDto dto, CancellationToken ct)
        => Ok(ApiResponse<AutomationStatusDto>.Ok(await _service.UpdateSettingsAsync(dto, ct)));

    /// <summary>اجرای فوری اتوماسیون سفارش‌دهی</summary>
    [HttpPost("replenishment/run")]
    public async Task<ActionResult<ApiResponse<ReplenishmentResultDto>>> Run(
        [FromBody] RunAutomationDto? dto, CancellationToken ct)
    {
        var user = CurrentUser.From(HttpContext);
        var result = await _service.RunAsync(dto ?? new RunAutomationDto(), user, ct);
        return Ok(ApiResponse<ReplenishmentResultDto>.Ok(result));
    }

    /// <summary>فهرست اجراهای اتوماسیون</summary>
    [HttpGet("runs")]
    public async Task<ActionResult<ApiResponse<List<ReplenishmentSummaryDto>>>> Runs(
        [FromQuery] int take = 50, CancellationToken ct = default)
        => Ok(ApiResponse<List<ReplenishmentSummaryDto>>.Ok(await _service.GetRunsAsync(take, ct)));

    /// <summary>جزئیات یک اجرا به همراه پیشنهادهای تولیدشده</summary>
    [HttpGet("runs/{id:int}")]
    public async Task<ActionResult<ApiResponse<ReplenishmentResultDto>>> Run(int id, CancellationToken ct)
        => Ok(ApiResponse<ReplenishmentResultDto>.Ok(await _service.GetRunAsync(id, ct)));

    /// <summary>تاریخچه رویدادهای یک اجرا</summary>
    [HttpGet("runs/{id:int}/audit")]
    public async Task<ActionResult<ApiResponse<List<AutomationAuditLogDto>>>> Audit(int id, CancellationToken ct)
        => Ok(ApiResponse<List<AutomationAuditLogDto>>.Ok(await _service.GetAuditAsync(id, ct)));
}
