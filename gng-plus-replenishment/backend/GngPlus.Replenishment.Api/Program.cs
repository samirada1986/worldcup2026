using System.Text.Json.Serialization;
using GngPlus.Replenishment.Api.Middleware;
using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

const string AngularCorsPolicy = "gngplus-angular";

// --- پایگاه داده و سرویس‌ها ---
// در صورت خالی بودن رشته اتصال، پایگاه داده درون‌حافظه استفاده می‌شود.
builder.Services.AddReplenishmentModule(builder.Configuration.GetConnectionString("Replenishment"));

builder.Services
    .AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        o.JsonSerializerOptions.Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping;
    });

// خطاهای اعتبارسنجی مدل نیز با همان قالب استاندارد بازگردانده می‌شوند
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var details = context.ModelState
            .Where(kv => kv.Value?.Errors.Count > 0)
            .ToDictionary(
                kv => kv.Key,
                kv => (object?)string.Join(" ", kv.Value!.Errors.Select(e => e.ErrorMessage)));

        return new BadRequestObjectResult(new ApiErrorResponse
        {
            Success = false,
            Code = ResultCodes.ValidationFailed,
            Message = "اطلاعات ارسالی معتبر نیست.",
            Details = details
        });
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "GNG+ — اتوماسیون سفارش‌دهی کالا",
        Version = "v1",
        Description = "APIهای ماژول پارامترهای سفارش‌دهی، محاسبه نیاز سفارش، درخواست خرید و اتوماسیون."
    });

    var xmlPath = Path.Combine(AppContext.BaseDirectory,
        $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml");
    if (File.Exists(xmlPath)) o.IncludeXmlComments(xmlPath);
});

builder.Services.AddCors(o => o.AddPolicy(AngularCorsPolicy, policy => policy
    .WithOrigins(
        builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
        ?? new[] { "http://localhost:4200", "https://localhost:4200" })
    .AllowAnyHeader()
    .AllowAnyMethod()));

var app = builder.Build();

// --- آماده‌سازی پایگاه داده و داده نمونه ---
await app.Services.InitializeDatabaseAsync();

app.UseMiddleware<ApiExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(o =>
{
    o.SwaggerEndpoint("/swagger/v1/swagger.json", "GNG+ Replenishment API v1");
    o.DocumentTitle = "GNG+ — اتوماسیون سفارش‌دهی کالا";
});

app.UseCors(AngularCorsPolicy);
app.MapControllers();

app.MapGet("/", () => Results.Redirect("/swagger"))
    .ExcludeFromDescription();

app.Run();

/// <summary>نقطه ورود برنامه — برای دسترسی آزمون‌های یکپارچگی عمومی شده است</summary>
public partial class Program { }
