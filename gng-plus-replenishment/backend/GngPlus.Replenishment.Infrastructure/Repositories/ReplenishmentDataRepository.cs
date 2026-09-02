using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GngPlus.Replenishment.Infrastructure.Repositories;

/// <summary>
/// لایه داده محاسبه نیاز سفارش.
/// مجموعه کلیدهای کسب‌وکار مورد بررسی، اجتماع «پارامترهای تعریف‌شده» و
/// «موجودی‌های ثبت‌شده» است؛ بنابراین کالایی که موجودی دارد ولی پارامتر ندارد
/// نیز در نتیجه با وضعیت «خطای تنظیمات» دیده می‌شود.
/// </summary>
public class ReplenishmentDataRepository : IReplenishmentDataRepository
{
    /// <summary>پنجره پیش‌فرض تحلیل مصرف وقتی در پارامتر و فیلتر چیزی تعیین نشده باشد</summary>
    private const int DefaultConsumptionWindowDays = 30;

    private readonly ReplenishmentDbContext _db;

    public ReplenishmentDataRepository(ReplenishmentDbContext db) => _db = db;

    public async Task<List<ReplenishmentInput>> LoadInputsAsync(
        ReplenishmentFilterDto filter, CancellationToken ct = default)
    {
        var windowEnd = (filter.ToDate ?? DateTime.UtcNow).Date;

        // --- کالاهای مشمول فیلتر ---
        var productsQuery = _db.Products.AsNoTracking()
            .Include(p => p.UnitOfMeasure)
            .AsQueryable();

        if (filter.ProductId.HasValue)
            productsQuery = productsQuery.Where(p => p.Id == filter.ProductId.Value);
        if (filter.ProductGroupId.HasValue)
            productsQuery = productsQuery.Where(p => p.ProductGroupId == filter.ProductGroupId.Value);
        if (filter.ProductNatureId.HasValue)
            productsQuery = productsQuery.Where(p => p.NatureId == filter.ProductNatureId.Value);

        var products = await productsQuery.ToDictionaryAsync(p => p.Id, ct);
        var productIds = products.Keys.ToHashSet();

        var warehouses = await _db.Warehouses.AsNoTracking().ToDictionaryAsync(w => w.Id, ct);
        var sites = await _db.Sites.AsNoTracking().ToDictionaryAsync(s => s.Id, ct);
        var units = await _db.UnitsOfMeasure.AsNoTracking().ToDictionaryAsync(u => u.Id, ct);

        // --- پارامترهای مشمول فیلتر ---
        var parametersQuery = _db.InventoryOrderParameters.AsNoTracking().AsQueryable();

        if (filter.WarehouseId.HasValue)
            parametersQuery = parametersQuery.Where(x => x.WarehouseId == filter.WarehouseId.Value);
        if (filter.SiteId.HasValue)
            parametersQuery = parametersQuery.Where(x => x.SiteId == filter.SiteId.Value);
        if (filter.ParameterScopeId.HasValue)
            parametersQuery = parametersQuery.Where(x => x.ParameterScopeId == filter.ParameterScopeId.Value);

        var parameters = (await parametersQuery.ToListAsync(ct))
            .Where(x => productIds.Contains(x.ProductId))
            .ToDictionary(x => new ReplenishmentBusinessKey(x.ProductId, x.WarehouseId, x.SiteId));

        // --- آخرین تصویر موجودی برای هر کلید کسب‌وکار ---
        var snapshotsQuery = _db.InventorySnapshots.AsNoTracking()
            .Where(s => s.SnapshotDate <= windowEnd);

        if (filter.WarehouseId.HasValue)
            snapshotsQuery = snapshotsQuery.Where(s => s.WarehouseId == filter.WarehouseId.Value);
        if (filter.SiteId.HasValue)
            snapshotsQuery = snapshotsQuery.Where(s => s.SiteId == filter.SiteId.Value);

        var latestSnapshots = (await snapshotsQuery.ToListAsync(ct))
            .Where(s => productIds.Contains(s.ProductId))
            .GroupBy(s => new ReplenishmentBusinessKey(s.ProductId, s.WarehouseId, s.SiteId))
            .ToDictionary(g => g.Key, g => g.OrderByDescending(s => s.SnapshotDate).First());

        // --- مقدار درخواست‌های خرید باز ---
        var openQuantities = await GetOpenRequestQuantitiesAsync(ct);

        // --- تاریخچه مصرف در بازه تحلیل ---
        var widestWindowStart = ResolveWidestWindowStart(filter, parameters.Values, windowEnd);

        var consumption = (await _db.ConsumptionHistories.AsNoTracking()
                .Where(c => c.Date >= widestWindowStart && c.Date <= windowEnd)
                .ToListAsync(ct))
            .Where(c => productIds.Contains(c.ProductId))
            .ToLookup(c => (c.ProductId, c.WarehouseId));

        // --- اجتماع کلیدهای کسب‌وکار ---
        var keys = parameters.Keys.Union(latestSnapshots.Keys).Distinct().ToList();

        var inputs = new List<ReplenishmentInput>(keys.Count);

        foreach (var key in keys)
        {
            parameters.TryGetValue(key, out var parameter);
            latestSnapshots.TryGetValue(key, out var snapshot);
            products.TryGetValue(key.ProductId, out var product);
            warehouses.TryGetValue(key.WarehouseId, out var warehouse);
            sites.TryGetValue(key.SiteId, out var site);

            var (windowStart, windowDays) = ResolveWindow(filter, parameter, windowEnd);

            var records = consumption[(key.ProductId, key.WarehouseId)]
                .Where(c => c.Date >= windowStart && c.Date <= windowEnd)
                .ToList();

            var unitId = parameter?.UnitOfMeasureId ?? product?.UnitOfMeasureId ?? 0;
            units.TryGetValue(unitId, out var unit);

            inputs.Add(new ReplenishmentInput
            {
                ProductId = key.ProductId,
                WarehouseId = key.WarehouseId,
                SiteId = key.SiteId,
                Parameter = parameter,
                Product = product,
                Warehouse = warehouse,
                Site = site,
                UnitOfMeasure = unit,
                HasInventorySnapshot = snapshot is not null,
                OnHandQuantity = snapshot?.OnHandQuantity ?? 0m,
                ReservedQuantity = snapshot?.ReservedQuantity ?? 0m,
                ConfirmedIncomingQuantity = snapshot?.ConfirmedIncomingQuantity ?? 0m,
                TotalConsumption = records.Sum(c => c.Quantity),
                ConsumptionWindowDays = windowDays,
                HasConsumptionHistory = records.Count > 0,
                OpenPurchaseRequestQuantity = openQuantities.GetValueOrDefault(key, 0m)
            });
        }

        return inputs
            .OrderBy(i => i.Product?.Code, StringComparer.Ordinal)
            .ThenBy(i => i.WarehouseId)
            .ToList();
    }

    public async Task<Dictionary<ReplenishmentBusinessKey, decimal>> GetOpenRequestQuantitiesAsync(
        CancellationToken ct = default)
    {
        var openStatuses = PurchaseRequest.OpenStatuses;

        // تجمیع در حافظه انجام می‌شود چون SQLite از Sum روی decimal پشتیبانی نمی‌کند.
        var rows = await _db.PurchaseRequestItems.AsNoTracking()
            .Where(i => openStatuses.Contains(i.PurchaseRequest!.Status))
            .Select(i => new { i.ProductId, i.WarehouseId, i.SiteId, i.RequestedQuantity })
            .ToListAsync(ct);

        return rows
            .GroupBy(r => new ReplenishmentBusinessKey(r.ProductId, r.WarehouseId, r.SiteId))
            .ToDictionary(g => g.Key, g => g.Sum(x => x.RequestedQuantity));
    }

    /// <summary>
    /// تعیین پنجره تحلیل مصرف برای یک پارامتر.
    /// اولویت با بازه تاریخی فیلتر است؛ در نبود آن، «تعداد روز برای محاسبه میانگین مصرف» پارامتر استفاده می‌شود.
    /// </summary>
    private static (DateTime Start, int Days) ResolveWindow(
        ReplenishmentFilterDto filter, InventoryOrderParameter? parameter, DateTime windowEnd)
    {
        if (filter.FromDate.HasValue)
        {
            var start = filter.FromDate.Value.Date;
            var days = Math.Max(1, (windowEnd - start).Days + 1);
            return (start, days);
        }

        var configuredDays = parameter?.AverageConsumptionDays is > 0
            ? parameter.AverageConsumptionDays!.Value
            : DefaultConsumptionWindowDays;

        return (windowEnd.AddDays(-configuredDays + 1), configuredDays);
    }

    /// <summary>بزرگ‌ترین پنجره لازم برای یک‌بار خواندن تاریخچه مصرف</summary>
    private static DateTime ResolveWidestWindowStart(
        ReplenishmentFilterDto filter, IEnumerable<InventoryOrderParameter> parameters, DateTime windowEnd)
    {
        if (filter.FromDate.HasValue)
            return filter.FromDate.Value.Date;

        var maxDays = parameters
            .Select(p => p.AverageConsumptionDays ?? DefaultConsumptionWindowDays)
            .DefaultIfEmpty(DefaultConsumptionWindowDays)
            .Max();

        return windowEnd.AddDays(-Math.Max(maxDays, DefaultConsumptionWindowDays) + 1);
    }
}
