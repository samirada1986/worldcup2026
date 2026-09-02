namespace GngPlus.Replenishment.Application.Common;

/// <summary>
/// کدهای ماشین‌خوان نتیجه ارزیابی و خطا به همراه پیام فارسی متناظر.
/// فرانت‌اند فقط این کدها را می‌شناسد و هیچ محاسبه‌ای انجام نمی‌دهد.
/// </summary>
public static class ResultCodes
{
    // --- قواعد استثنا / اعتبارسنجی پارامتر ---
    public const string ParameterInactive = "PARAMETER_INACTIVE";
    public const string ParameterExpired = "PARAMETER_EXPIRED";
    public const string ParameterNotYetValid = "PARAMETER_NOT_YET_VALID";
    public const string ParameterMissing = "REPLENISHMENT_PARAMETER_MISSING";
    public const string LeadTimeMissing = "LEAD_TIME_MISSING";
    public const string InvalidMinMax = "INVALID_MIN_MAX_CONFIGURATION";
    public const string InvalidOrderQuantityRange = "INVALID_ORDER_QUANTITY_RANGE";
    public const string NegativeInventory = "NEGATIVE_ABNORMAL_INVENTORY";
    public const string InventorySnapshotMissing = "INVENTORY_SNAPSHOT_MISSING";
    public const string OpenRequestExists = "OPEN_PURCHASE_REQUEST_EXISTS";
    public const string AboveMaximumOrderQuantity = "SUGGESTED_ABOVE_MAXIMUM_ORDER_QUANTITY";
    public const string WarehouseMissing = "WAREHOUSE_MISSING";
    public const string SiteMissing = "SITE_MISSING";
    public const string ReorderPointMissing = "REORDER_POINT_MISSING";
    public const string TargetLevelMissing = "TARGET_LEVEL_MISSING";
    public const string ConsumptionDaysMissing = "AVERAGE_CONSUMPTION_DAYS_MISSING";
    public const string NoConsumptionHistory = "NO_CONSUMPTION_HISTORY";

    // --- نتایج عادی محاسبه ---
    public const string BelowReorderPoint = "BELOW_REORDER_POINT";
    public const string BelowMinimumStock = "BELOW_MINIMUM_STOCK";
    public const string BelowDesiredLevel = "BELOW_DESIRED_LEVEL";
    public const string BelowConsumptionTarget = "BELOW_CONSUMPTION_TARGET";
    public const string StockSufficient = "STOCK_SUFFICIENT";
    public const string NonPositiveSuggestion = "NON_POSITIVE_SUGGESTION";
    public const string RaisedToMinimumOrderQuantity = "RAISED_TO_MINIMUM_ORDER_QUANTITY";
    public const string RoundedToBatchSize = "ROUNDED_TO_BATCH_SIZE";

    // --- خطاهای سطح API ---
    public const string ValidationFailed = "VALIDATION_FAILED";
    public const string InvalidReplenishmentParameter = "INVALID_REPLENISHMENT_PARAMETER";
    public const string NotFound = "RESOURCE_NOT_FOUND";
    public const string NoValidRecommendations = "NO_VALID_RECOMMENDATIONS";
    public const string ChangeReasonRequired = "QUANTITY_CHANGE_REASON_REQUIRED";
    public const string DuplicateDraftPrevented = "DUPLICATE_DRAFT_PREVENTED";
    public const string InvalidStatusTransition = "INVALID_STATUS_TRANSITION";
    public const string InternalError = "INTERNAL_SERVER_ERROR";
}
