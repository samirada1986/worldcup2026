using GngPlus.Replenishment.Application.Dtos;

namespace GngPlus.Replenishment.Application.Abstractions;

/// <summary>سرویس محاسبه نیاز سفارش — تمام منطق کسب‌وکار در این سرویس انجام می‌شود</summary>
public interface IReplenishmentService
{
    /// <summary>
    /// اجرای کامل چرخه: خواندن پارامترها ← خواندن موجودی ← محاسبه موجودی موثر ←
    /// محاسبه مصرف ← ارزیابی قواعد ← تولید پیشنهاد ← بررسی درخواست‌های باز ← ثبت تاریخچه.
    /// </summary>
    Task<ReplenishmentResultDto> CalculateAsync(
        ReplenishmentFilterDto filter, string triggeredBy, CancellationToken ct = default);
}

/// <summary>سرویس مدیریت پارامترهای سفارش‌دهی کالا</summary>
public interface IInventoryOrderParameterService
{
    Task<List<InventoryOrderParameterDto>> QueryAsync(ParameterQueryDto query, CancellationToken ct = default);
    Task<InventoryOrderParameterDto> GetAsync(int id, CancellationToken ct = default);
    Task<InventoryOrderParameterDto> CreateAsync(InventoryOrderParameterUpsertDto dto, CancellationToken ct = default);
    Task<InventoryOrderParameterDto> UpdateAsync(int id, InventoryOrderParameterUpsertDto dto, CancellationToken ct = default);
    Task<InventoryOrderParameterDto> ChangeStatusAsync(int id, bool isActive, CancellationToken ct = default);
}

/// <summary>سرویس درخواست خرید</summary>
public interface IPurchaseRequestService
{
    /// <summary>ایجاد پیش‌نویس درخواست خرید از پیشنهادهای انتخاب‌شده — عملیات خنثی‌پذیر (idempotent)</summary>
    Task<PurchaseRequestDto> CreateDraftAsync(
        CreateDraftPurchaseRequestDto dto, string createdBy, CancellationToken ct = default);

    Task<PurchaseRequestDto> GetAsync(int id, CancellationToken ct = default);

    Task<List<PurchaseRequestDto>> GetAllAsync(CancellationToken ct = default);

    /// <summary>ارسال به گردش‌کار — تغییر وضعیت از پیش‌نویس به ارسال‌شده</summary>
    Task<PurchaseRequestDto> SubmitAsync(int id, string submittedBy, CancellationToken ct = default);
}

/// <summary>سرویس اتوماسیون سفارش‌دهی</summary>
public interface IAutomationService
{
    Task<AutomationStatusDto> GetStatusAsync(CancellationToken ct = default);
    Task<AutomationStatusDto> UpdateSettingsAsync(UpdateAutomationSettingsDto dto, CancellationToken ct = default);
    Task<ReplenishmentResultDto> RunAsync(RunAutomationDto dto, string triggeredBy, CancellationToken ct = default);
    Task<List<ReplenishmentSummaryDto>> GetRunsAsync(int take, CancellationToken ct = default);
    Task<ReplenishmentResultDto> GetRunAsync(int id, CancellationToken ct = default);
    Task<List<AutomationAuditLogDto>> GetAuditAsync(int runId, CancellationToken ct = default);
}

/// <summary>سرویس لیست‌های انتخابی</summary>
public interface ILookupService
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
    List<EnumItemDto> GetOrderingMethods();
    List<EnumItemDto> GetComparisonParameters();
    List<EnumItemDto> GetRecommendationStatuses();
}
