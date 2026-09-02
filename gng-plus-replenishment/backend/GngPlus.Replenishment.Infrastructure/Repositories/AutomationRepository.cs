using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace GngPlus.Replenishment.Infrastructure.Repositories;

public class AutomationRepository : IAutomationRepository
{
    private readonly ReplenishmentDbContext _db;

    public AutomationRepository(ReplenishmentDbContext db) => _db = db;

    public async Task<AutomationRun> AddRunAsync(AutomationRun run, CancellationToken ct = default)
    {
        await _db.AutomationRuns.AddAsync(run, ct);
        return run;
    }

    public Task<AutomationRun?> GetRunAsync(int id, CancellationToken ct = default)
        => _db.AutomationRuns.FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<List<AutomationRun>> GetRunsAsync(int take, CancellationToken ct = default)
        => await _db.AutomationRuns.AsNoTracking()
            .OrderByDescending(x => x.StartedAt)
            .ThenByDescending(x => x.Id)
            .Take(take)
            .ToListAsync(ct);

    public async Task<List<AutomationAuditLog>> GetAuditLogsAsync(int runId, CancellationToken ct = default)
        => await _db.AutomationAuditLogs.AsNoTracking()
            .Include(x => x.Product)
            .Where(x => x.AutomationRunId == runId)
            .OrderBy(x => x.Id)
            .ToListAsync(ct);

    public async Task<List<ReplenishmentRecommendation>> GetRecommendationsAsync(
        int runId, CancellationToken ct = default)
        => await _db.ReplenishmentRecommendations.AsNoTracking()
            .Include(x => x.Product)
            .Include(x => x.Warehouse)
            .Include(x => x.Site)
            .Where(x => x.AutomationRunId == runId)
            .OrderBy(x => x.Status)
            .ThenBy(x => x.Product!.Code)
            .ToListAsync(ct);

    public async Task<List<ReplenishmentRecommendation>> GetRecommendationsByIdsAsync(
        IEnumerable<int> ids, CancellationToken ct = default)
    {
        var idList = ids.ToList();
        return await _db.ReplenishmentRecommendations
            .Include(x => x.Product)
            .Where(x => idList.Contains(x.Id))
            .ToListAsync(ct);
    }

    public async Task<AutomationSettings> GetSettingsAsync(CancellationToken ct = default)
    {
        var settings = await _db.AutomationSettings.FirstOrDefaultAsync(ct);

        if (settings is null)
        {
            settings = new AutomationSettings();
            await _db.AutomationSettings.AddAsync(settings, ct);
            await _db.SaveChangesAsync(ct);
        }

        return settings;
    }

    public Task SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
