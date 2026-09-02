using System.Globalization;
using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GngPlus.Replenishment.Infrastructure.Repositories;

public class PurchaseRequestRepository : IPurchaseRequestRepository
{
    private static readonly PersianCalendar PersianCalendar = new();

    private readonly ReplenishmentDbContext _db;

    public PurchaseRequestRepository(ReplenishmentDbContext db) => _db = db;

    private IQueryable<PurchaseRequest> WithIncludes()
        => _db.PurchaseRequests
            .Include(x => x.Items).ThenInclude(i => i.Product)
            .Include(x => x.Items).ThenInclude(i => i.Warehouse)
            .Include(x => x.Items).ThenInclude(i => i.Site)
            .Include(x => x.Items).ThenInclude(i => i.UnitOfMeasure);

    public Task<PurchaseRequest?> GetByIdAsync(int id, CancellationToken ct = default)
        => WithIncludes().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<PurchaseRequest?> GetByIdempotencyKeyAsync(string key, CancellationToken ct = default)
        => WithIncludes().FirstOrDefaultAsync(x => x.IdempotencyKey == key, ct);

    public async Task<List<PurchaseRequest>> GetAllAsync(CancellationToken ct = default)
        => await WithIncludes().OrderByDescending(x => x.Id).ToListAsync(ct);

    public async Task<HashSet<ReplenishmentBusinessKey>> GetOpenBusinessKeysAsync(CancellationToken ct = default)
    {
        var openStatuses = PurchaseRequest.OpenStatuses;

        var rows = await _db.PurchaseRequestItems.AsNoTracking()
            .Where(i => openStatuses.Contains(i.PurchaseRequest!.Status))
            .Select(i => new { i.ProductId, i.WarehouseId, i.SiteId })
            .Distinct()
            .ToListAsync(ct);

        return rows
            .Select(r => new ReplenishmentBusinessKey(r.ProductId, r.WarehouseId, r.SiteId))
            .ToHashSet();
    }

    public async Task AddAsync(PurchaseRequest request, CancellationToken ct = default)
        => await _db.PurchaseRequests.AddAsync(request, ct);

    /// <summary>
    /// تولید شماره درخواست به قالب PR-{سال شمسی}-{شماره ترتیبی ۶ رقمی}.
    /// شماره ترتیبی در هر سال شمسی از نو آغاز می‌شود.
    /// </summary>
    public async Task<string> GenerateRequestNumberAsync(CancellationToken ct = default)
    {
        var persianYear = PersianCalendar.GetYear(DateTime.UtcNow);
        var prefix = $"PR-{persianYear}-";

        var lastNumber = await _db.PurchaseRequests
            .Where(x => x.RequestNumber.StartsWith(prefix))
            .OrderByDescending(x => x.RequestNumber)
            .Select(x => x.RequestNumber)
            .FirstOrDefaultAsync(ct);

        var sequence = 1;
        if (lastNumber is not null)
        {
            var tail = lastNumber[prefix.Length..];
            if (int.TryParse(tail, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsed))
                sequence = parsed + 1;
        }

        return $"{prefix}{sequence:D6}";
    }

    public Task SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
