using System.Text.Json;
using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;

namespace GngPlus.Replenishment.Api.Middleware;

/// <summary>
/// تبدیل تمام خطاها به پاسخ استاندارد.
/// هیچ استثنای خام سرور به فرانت‌اند بازگردانده نمی‌شود.
/// </summary>
public class ApiExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ApiExceptionMiddleware> _logger;

    public ApiExceptionMiddleware(RequestDelegate next, ILogger<ApiExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (BusinessRuleException ex)
        {
            _logger.LogInformation(ex, "قاعده کسب‌وکار نقض شد: {Code}", ex.Code);
            await WriteAsync(context, StatusCodeFor(ex.Code), ex.Code, ex.Message, ex.Details);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "خطای پیش‌بینی‌نشده در پردازش درخواست {Path}", context.Request.Path);
            await WriteAsync(context, StatusCodes.Status500InternalServerError,
                ResultCodes.InternalError,
                "خطای غیرمنتظره‌ای در سرور رخ داد. لطفاً با پشتیبانی تماس بگیرید.",
                new Dictionary<string, object?>());
        }
    }

    private static int StatusCodeFor(string code) => code switch
    {
        ResultCodes.NotFound => StatusCodes.Status404NotFound,
        ResultCodes.InternalError => StatusCodes.Status500InternalServerError,
        ResultCodes.DuplicateDraftPrevented => StatusCodes.Status409Conflict,
        ResultCodes.InvalidStatusTransition => StatusCodes.Status409Conflict,
        _ => StatusCodes.Status400BadRequest
    };

    private static async Task WriteAsync(
        HttpContext context, int statusCode, string code, string message,
        IDictionary<string, object?> details)
    {
        if (context.Response.HasStarted) return;

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/json; charset=utf-8";

        var payload = new ApiErrorResponse
        {
            Success = false,
            Code = code,
            Message = message,
            Details = details
        };

        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        });

        await context.Response.WriteAsync(json);
    }
}
