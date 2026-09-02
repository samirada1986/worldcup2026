using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GngPlus.Replenishment.Infrastructure.Repositories;

public class LookupRepository : ILookupRepository
{
    private readonly ReplenishmentDbContext _db;

    public LookupRepository(ReplenishmentDbContext db) => _db = db;

    public async Task<List<LookupItemDto>> GetProductsAsync(CancellationToken ct = default)
        => await _db.Products.AsNoTracking()
            .OrderBy(x => x.Code)
            .Select(x => new LookupItemDto
            {
                Id = x.Id,
                Name = x.Name,
                Code = x.Code,
                ParentId = x.ProductGroupId
            })
            .ToListAsync(ct);

    public async Task<List<LookupItemDto>> GetWarehousesAsync(CancellationToken ct = default)
        => await _db.Warehouses.AsNoTracking()
            .OrderBy(x => x.Name)
            .Select(x => new LookupItemDto { Id = x.Id, Name = x.Name, ParentId = x.SiteId })
            .ToListAsync(ct);

    public async Task<List<LookupItemDto>> GetSitesAsync(CancellationToken ct = default)
        => await Simple(_db.Sites.Select(x => new LookupItemDto { Id = x.Id, Name = x.Name }), ct);

    public async Task<List<LookupItemDto>> GetProductGroupsAsync(CancellationToken ct = default)
        => await Simple(_db.ProductGroups.Select(x => new LookupItemDto { Id = x.Id, Name = x.Name }), ct);

    public async Task<List<LookupItemDto>> GetProductNaturesAsync(CancellationToken ct = default)
        => await Simple(_db.ProductNatures.Select(x => new LookupItemDto { Id = x.Id, Name = x.Name }), ct);

    public async Task<List<LookupItemDto>> GetUnitsOfMeasureAsync(CancellationToken ct = default)
        => await Simple(_db.UnitsOfMeasure.Select(x => new LookupItemDto { Id = x.Id, Name = x.Name }), ct);

    public async Task<List<LookupItemDto>> GetParameterScopesAsync(CancellationToken ct = default)
        => await Simple(_db.ParameterScopes.Select(x => new LookupItemDto { Id = x.Id, Name = x.Name }), ct);

    public async Task<List<LookupItemDto>> GetRequestTypesAsync(CancellationToken ct = default)
        => await Simple(_db.RequestTypes.Select(x => new LookupItemDto { Id = x.Id, Name = x.Name }), ct);

    public async Task<List<LookupItemDto>> GetRequestClassificationsAsync(CancellationToken ct = default)
        => await Simple(_db.RequestClassifications.Select(x => new LookupItemDto { Id = x.Id, Name = x.Name }), ct);

    public async Task<List<LookupItemDto>> GetQualityControlParametersAsync(CancellationToken ct = default)
        => await Simple(_db.QualityControlParameters.Select(x => new LookupItemDto { Id = x.Id, Name = x.Name }), ct);

    public async Task<List<LookupItemDto>> GetTestPlansAsync(CancellationToken ct = default)
        => await Simple(_db.TestPlans.Select(x => new LookupItemDto { Id = x.Id, Name = x.Name }), ct);

    private static Task<List<LookupItemDto>> Simple(IQueryable<LookupItemDto> query, CancellationToken ct)
        => query.AsNoTracking().OrderBy(x => x.Name).ToListAsync(ct);
}
