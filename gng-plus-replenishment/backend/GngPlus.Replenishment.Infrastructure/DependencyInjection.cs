using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Services;
using GngPlus.Replenishment.Infrastructure.Persistence;
using GngPlus.Replenishment.Infrastructure.Repositories;
using GngPlus.Replenishment.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace GngPlus.Replenishment.Infrastructure;

/// <summary>ثبت سرویس‌های لایه داده و کسب‌وکار</summary>
public static class DependencyInjection
{
    /// <summary>
    /// ثبت بستر داده و سرویس‌ها.
    /// در صورت خالی بودن رشته اتصال، پایگاه داده درون‌حافظه استفاده می‌شود.
    /// </summary>
    public static IServiceCollection AddReplenishmentModule(
        this IServiceCollection services, string? sqliteConnectionString)
    {
        if (string.IsNullOrWhiteSpace(sqliteConnectionString))
        {
            services.AddDbContext<ReplenishmentDbContext>(o =>
                o.UseInMemoryDatabase("gngplus-replenishment"));
        }
        else
        {
            services.AddDbContext<ReplenishmentDbContext>(o =>
                o.UseSqlite(sqliteConnectionString));
        }

        // لایه داده
        services.AddScoped<IInventoryOrderParameterRepository, InventoryOrderParameterRepository>();
        services.AddScoped<IReplenishmentDataRepository, ReplenishmentDataRepository>();
        services.AddScoped<IAutomationRepository, AutomationRepository>();
        services.AddScoped<IPurchaseRequestRepository, PurchaseRequestRepository>();
        services.AddScoped<ILookupRepository, LookupRepository>();
        services.AddScoped<IWorkflowService, SimulatedWorkflowService>();

        // لایه کسب‌وکار
        services.AddScoped<IReplenishmentService, ReplenishmentService>();
        services.AddScoped<IInventoryOrderParameterService, InventoryOrderParameterService>();
        services.AddScoped<IPurchaseRequestService, PurchaseRequestService>();
        services.AddScoped<IAutomationService, AutomationService>();
        services.AddScoped<ILookupService, LookupService>();

        return services;
    }

    /// <summary>آماده‌سازی پایگاه داده و بارگذاری داده نمونه</summary>
    public static async Task InitializeDatabaseAsync(this IServiceProvider provider, CancellationToken ct = default)
    {
        using var scope = provider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ReplenishmentDbContext>();

        if (db.Database.IsRelational())
            await db.Database.EnsureCreatedAsync(ct);

        await DataSeeder.SeedAsync(db, ct);
    }
}
