using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Entities;

namespace GngPlus.Replenishment.Application.Abstractions;

/// <summary>لایه داده پارامترهای سفارش‌دهی کالا</summary>
public interface IInventoryOrderParameterRepository
{
    Task<List<InventoryOrderParameter>> QueryAsync(ParameterQueryDto query, CancellationToken ct = default);
    Task<InventoryOrderParameter?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<bool> ExistsForBusinessKeyAsync(int productId, int warehouseId, int siteId, int? excludeId, CancellationToken ct = default);
    Task AddAsync(InventoryOrderParameter entity, CancellationToken ct = default);
    void Update(InventoryOrderParameter entity);
    Task SaveChangesAsync(CancellationToken ct = default);
}

/// <summary>لایه داده ورودی‌های محاسبه نیاز سفارش</summary>
public interface IReplenishmentDataRepository
{
    /// <summary>ساخت بسته‌های ورودی محاسبه بر اساس فیلتر صفحه</summary>
    Task<List<ReplenishmentInput>> LoadInputsAsync(ReplenishmentFilterDto filter, CancellationToken ct = default);

    /// <summary>مجموع مقدار درخواست‌های خرید باز به تفکیک کلید کسب‌وکار</summary>
    Task<Dictionary<ReplenishmentBusinessKey, decimal>> GetOpenRequestQuantitiesAsync(CancellationToken ct = default);
}

/// <summary>لایه داده اجرای اتوماسیون، پیشنهادها و تاریخچه</summary>
public interface IAutomationRepository
{
    Task<AutomationRun> AddRunAsync(AutomationRun run, CancellationToken ct = default);
    Task<AutomationRun?> GetRunAsync(int id, CancellationToken ct = default);
    Task<List<AutomationRun>> GetRunsAsync(int take, CancellationToken ct = default);
    Task<List<AutomationAuditLog>> GetAuditLogsAsync(int runId, CancellationToken ct = default);
    Task<List<ReplenishmentRecommendation>> GetRecommendationsAsync(int runId, CancellationToken ct = default);
    Task<List<ReplenishmentRecommendation>> GetRecommendationsByIdsAsync(IEnumerable<int> ids, CancellationToken ct = default);
    Task<AutomationSettings> GetSettingsAsync(CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

/// <summary>لایه داده درخواست خرید</summary>
public interface IPurchaseRequestRepository
{
    Task<PurchaseRequest?> GetByIdAsync(int id, CancellationToken ct = default);
    Task<PurchaseRequest?> GetByIdempotencyKeyAsync(string key, CancellationToken ct = default);
    Task<List<PurchaseRequest>> GetAllAsync(CancellationToken ct = default);

    /// <summary>کلیدهای کسب‌وکاری که هم‌اکنون درخواست خرید باز دارند</summary>
    Task<HashSet<ReplenishmentBusinessKey>> GetOpenBusinessKeysAsync(CancellationToken ct = default);

    Task AddAsync(PurchaseRequest request, CancellationToken ct = default);
    Task<string> GenerateRequestNumberAsync(CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}

/// <summary>لایه داده لیست‌های انتخابی</summary>
public interface ILookupRepository
{
    Task<List<LookupItemDto>> GetProductsAsync(CancellationToken ct = default);
    Task<List<LookupItemDto>> GetWarehousesAsync(CancellationToken ct = default);
    Task<List<LookupItemDto>> GetSitesAsync(CancellationToken ct = default);
    Task<List<LookupItemDto>> GetProductGroupsAsync(CancellationToken ct = default);
    Task<List<LookupItemDto>> GetProductNaturesAsync(CancellationToken ct = default);
    Task<List<LookupItemDto>> GetUnitsOfMeasureAsync(CancellationToken ct = default);
    Task<List<LookupItemDto>> GetParameterScopesAsync(CancellationToken ct = default);
    Task<List<LookupItemDto>> GetRequestTypesAsync(CancellationToken ct = default);
    Task<List<LookupItemDto>> GetRequestClassificationsAsync(CancellationToken ct = default);
    Task<List<LookupItemDto>> GetQualityControlParametersAsync(CancellationToken ct = default);
    Task<List<LookupItemDto>> GetTestPlansAsync(CancellationToken ct = default);
}

/// <summary>گردش‌کار شبیه‌سازی‌شده برای نمونه اولیه</summary>
public interface IWorkflowService
{
    /// <summary>شروع گردش‌کار تایید درخواست خرید</summary>
    Task<WorkflowInstance> StartWorkflowAsync(PurchaseRequest request, CancellationToken ct = default);
}
