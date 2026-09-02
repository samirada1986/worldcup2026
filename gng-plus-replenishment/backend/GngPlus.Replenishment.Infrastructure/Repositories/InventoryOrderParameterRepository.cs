using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GngPlus.Replenishment.Infrastructure.Repositories;

public class InventoryOrderParameterRepository : IInventoryOrderParameterRepository
{
    private readonly ReplenishmentDbContext _db;

    public InventoryOrderParameterRepository(ReplenishmentDbContext db) => _db = db;

    private IQueryable<InventoryOrderParameter> WithIncludes()
        => _db.InventoryOrderParameters
            .Include(x => x.Product)
            .Include(x => x.Warehouse)
            .Include(x => x.Site)
            .Include(x => x.ParameterScope)
            .Include(x => x.UnitOfMeasure)
            .Include(x => x.RequestType);

    public async Task<List<InventoryOrderParameter>> QueryAsync(
        ParameterQueryDto query, CancellationToken ct = default)
    {
        var q = WithIncludes().AsQueryable();

        if (query.ProductId.HasValue) q = q.Where(x => x.ProductId == query.ProductId.Value);
        if (query.WarehouseId.HasValue) q = q.Where(x => x.WarehouseId == query.WarehouseId.Value);
        if (query.SiteId.HasValue) q = q.Where(x => x.SiteId == query.SiteId.Value);
        if (query.IsActive.HasValue) q = q.Where(x => x.IsActive == query.IsActive.Value);

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim();
            q = q.Where(x => x.Product!.Name.Contains(term) || x.Product!.Code.Contains(term));
        }

        return await q.OrderBy(x => x.Product!.Code).ToListAsync(ct);
    }

    public Task<InventoryOrderParameter?> GetByIdAsync(int id, CancellationToken ct = default)
        => WithIncludes().FirstOrDefaultAsync(x => x.Id == id, ct);

    public Task<bool> ExistsForBusinessKeyAsync(
        int productId, int warehouseId, int siteId, int? excludeId, CancellationToken ct = default)
        => _db.InventoryOrderParameters.AnyAsync(
            x => x.ProductId == productId &&
                 x.WarehouseId == warehouseId &&
                 x.SiteId == siteId &&
                 (excludeId == null || x.Id != excludeId.Value), ct);

    public async Task AddAsync(InventoryOrderParameter entity, CancellationToken ct = default)
        => await _db.InventoryOrderParameters.AddAsync(entity, ct);

    public void Update(InventoryOrderParameter entity)
        => _db.InventoryOrderParameters.Update(entity);

    public Task SaveChangesAsync(CancellationToken ct = default)
        => _db.SaveChangesAsync(ct);
}
