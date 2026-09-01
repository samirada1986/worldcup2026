using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GngPlus.Replenishment.Api.Controllers;

/// <summary>محاسبه نیاز سفارش کالا</summary>
[ApiController]
[Route("api/replenishment")]
[Produces("application/json")]
public class ReplenishmentController : ControllerBase
{
    private readonly IReplenishmentService _service;

    public ReplenishmentController(IReplenishmentService service) => _service = service;

    /// <summary>
    /// اجرای محاسبه نیاز سفارش برای فیلتر داده‌شده.
    /// تمام قواعد کسب‌وکار در لایه سرویس اجرا می‌شوند.
    /// </summary>
    [HttpPost("calculate")]
    public async Task<ActionResult<ApiResponse<ReplenishmentResultDto>>> Calculate(
        [FromBody] ReplenishmentFilterDto filter, CancellationToken ct)
    {
        var user = CurrentUser.From(HttpContext);
        var result = await _service.CalculateAsync(filter ?? new ReplenishmentFilterDto(), user, ct);
        return Ok(ApiResponse<ReplenishmentResultDto>.Ok(result));
    }
}

/// <summary>
/// شناسه کاربر جاری.
/// در نمونه اولیه احراز هویت پیاده‌سازی نشده و نام کاربر از هدر خوانده می‌شود.
/// </summary>
public static class CurrentUser
{
    public const string HeaderName = "X-User-Name";
    private const string Fallback = "کاربر آزمایشی";

    public static string From(HttpContext context)
    {
        var header = context.Request.Headers[HeaderName].ToString();
        return string.IsNullOrWhiteSpace(header) ? Fallback : header.Trim();
    }
}
