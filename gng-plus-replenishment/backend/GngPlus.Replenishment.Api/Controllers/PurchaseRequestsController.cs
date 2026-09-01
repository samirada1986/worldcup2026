using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Dtos;
using Microsoft.AspNetCore.Mvc;

namespace GngPlus.Replenishment.Api.Controllers;

/// <summary>درخواست خرید</summary>
[ApiController]
[Route("api/purchase-requests")]
[Produces("application/json")]
public class PurchaseRequestsController : ControllerBase
{
    /// <summary>هدر یکتاسازی عملیات — از ایجاد پیش‌نویس تکراری جلوگیری می‌کند</summary>
    private const string IdempotencyHeader = "Idempotency-Key";

    private readonly IPurchaseRequestService _service;

    public PurchaseRequestsController(IPurchaseRequestService service) => _service = service;

    /// <summary>فهرست درخواست‌های خرید</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<List<PurchaseRequestDto>>>> GetAll(CancellationToken ct)
        => Ok(ApiResponse<List<PurchaseRequestDto>>.Ok(await _service.GetAllAsync(ct)));

    /// <summary>خواندن یک درخواست خرید</summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ApiResponse<PurchaseRequestDto>>> Get(int id, CancellationToken ct)
        => Ok(ApiResponse<PurchaseRequestDto>.Ok(await _service.GetAsync(id, ct)));

    /// <summary>
    /// ایجاد پیش‌نویس درخواست خرید از پیشنهادهای انتخاب‌شده.
    /// عملیات خنثی‌پذیر است: ارسال دوباره با همان کلید یکتاسازی،
    /// همان درخواست قبلی را بازمی‌گرداند و درخواست تکراری نمی‌سازد.
    /// </summary>
    [HttpPost("draft")]
    public async Task<ActionResult<ApiResponse<PurchaseRequestDto>>> CreateDraft(
        [FromBody] CreateDraftPurchaseRequestDto dto, CancellationToken ct)
    {
        // کلید یکتاسازی می‌تواند از بدنه یا هدر بیاید
        if (string.IsNullOrWhiteSpace(dto.IdempotencyKey))
        {
            var header = Request.Headers[IdempotencyHeader].ToString();
            if (!string.IsNullOrWhiteSpace(header))
                dto.IdempotencyKey = header.Trim();
        }

        var user = CurrentUser.From(HttpContext);
        var created = await _service.CreateDraftAsync(dto, user, ct);

        return created.IsExisting
            ? Ok(ApiResponse<PurchaseRequestDto>.Ok(created))
            : CreatedAtAction(nameof(Get), new { id = created.Id },
                ApiResponse<PurchaseRequestDto>.Ok(created));
    }

    /// <summary>ارسال درخواست خرید به گردش‌کار</summary>
    [HttpPost("{id:int}/submit")]
    public async Task<ActionResult<ApiResponse<PurchaseRequestDto>>> Submit(int id, CancellationToken ct)
    {
        var user = CurrentUser.From(HttpContext);
        return Ok(ApiResponse<PurchaseRequestDto>.Ok(await _service.SubmitAsync(id, user, ct)));
    }
}
