using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Domain.Enums;
using GngPlus.Replenishment.Infrastructure.Persistence;

namespace GngPlus.Replenishment.Infrastructure.Services;

/// <summary>
/// گردش‌کار شبیه‌سازی‌شده نمونه اولیه.
/// در محصول واقعی، این سرویس به موتور گردش‌کار GNG+ متصل می‌شود؛
/// در اینجا فقط یک رکورد نمونه گردش‌کار ثبت می‌شود.
/// </summary>
public class SimulatedWorkflowService : IWorkflowService
{
    private const string FirstStep = "بررسی کارشناس تدارکات";

    private readonly ReplenishmentDbContext _db;

    public SimulatedWorkflowService(ReplenishmentDbContext db) => _db = db;

    public async Task<WorkflowInstance> StartWorkflowAsync(
        PurchaseRequest request, CancellationToken ct = default)
    {
        var instance = new WorkflowInstance
        {
            InstanceKey = $"WF-{request.RequestNumber}",
            PurchaseRequestId = request.Id,
            Status = WorkflowStatus.Started,
            CurrentStep = FirstStep,
            StartedAt = DateTime.UtcNow
        };

        await _db.WorkflowInstances.AddAsync(instance, ct);
        await _db.SaveChangesAsync(ct);

        return instance;
    }
}
