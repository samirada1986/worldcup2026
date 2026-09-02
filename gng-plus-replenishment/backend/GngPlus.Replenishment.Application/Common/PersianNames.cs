using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Application.Common;

/// <summary>نام‌های فارسی مقادیر ثابت — تنها منبع حقیقت برای برچسب‌های وضعیت</summary>
public static class PersianNames
{
    public static string OrderingMethod(OrderingMethod value) => value switch
    {
        Domain.Enums.OrderingMethod.ReorderPoint => "نقطه سفارش",
        Domain.Enums.OrderingMethod.MinMax => "حداقل / حداکثر",
        Domain.Enums.OrderingMethod.DesiredLevel => "سطح مطلوب",
        Domain.Enums.OrderingMethod.ConsumptionBased => "بر اساس مصرف",
        _ => "نامشخص"
    };

    public static string RecommendationStatus(RecommendationStatus value) => value switch
    {
        Domain.Enums.RecommendationStatus.NeedsOrder => "نیازمند سفارش",
        Domain.Enums.RecommendationStatus.NeedsReview => "نیازمند بررسی",
        Domain.Enums.RecommendationStatus.OpenRequestExists => "درخواست باز موجود است",
        Domain.Enums.RecommendationStatus.NoNeed => "بدون نیاز",
        Domain.Enums.RecommendationStatus.ConfigurationError => "خطای تنظیمات",
        Domain.Enums.RecommendationStatus.DraftCreated => "پیش‌نویس ایجاد شد",
        _ => "نامشخص"
    };

    public static string PurchaseRequestStatus(PurchaseRequestStatus value) => value switch
    {
        Domain.Enums.PurchaseRequestStatus.Draft => "پیش‌نویس",
        Domain.Enums.PurchaseRequestStatus.Submitted => "ارسال‌شده",
        Domain.Enums.PurchaseRequestStatus.InProgress => "در حال بررسی",
        Domain.Enums.PurchaseRequestStatus.Approved => "تایید شده",
        Domain.Enums.PurchaseRequestStatus.Rejected => "رد شده",
        Domain.Enums.PurchaseRequestStatus.Cancelled => "ابطال شده",
        Domain.Enums.PurchaseRequestStatus.Closed => "بسته شده",
        _ => "نامشخص"
    };

    public static string PurchaseRequestSource(PurchaseRequestSource value) => value switch
    {
        Domain.Enums.PurchaseRequestSource.Manual => "ثبت دستی",
        Domain.Enums.PurchaseRequestSource.Automation => "اتوماسیون",
        _ => "نامشخص"
    };

    public static string TriggerType(AutomationTriggerType value) => value switch
    {
        AutomationTriggerType.Manual => "دستی",
        AutomationTriggerType.DailySchedule => "زمان‌بندی روزانه",
        _ => "نامشخص"
    };

    public static string RunStatus(AutomationRunStatus value) => value switch
    {
        AutomationRunStatus.Running => "در حال اجرا",
        AutomationRunStatus.Completed => "خاتمه یافته",
        AutomationRunStatus.Failed => "ناموفق",
        _ => "نامشخص"
    };

    public static string WorkflowStatus(WorkflowStatus value) => value switch
    {
        Domain.Enums.WorkflowStatus.NotStarted => "شروع نشده",
        Domain.Enums.WorkflowStatus.Started => "در گردش‌کار",
        Domain.Enums.WorkflowStatus.InReview => "در حال بررسی",
        Domain.Enums.WorkflowStatus.Completed => "خاتمه یافته",
        _ => "نامشخص"
    };

    public static string AuditEventType(AuditEventType value) => value switch
    {
        Domain.Enums.AuditEventType.RunStarted => "شروع اجرا",
        Domain.Enums.AuditEventType.ParameterEvaluated => "ارزیابی پارامتر",
        Domain.Enums.AuditEventType.StockCalculated => "محاسبه موجودی موثر",
        Domain.Enums.AuditEventType.RuleApplied => "اعمال قاعده سفارش‌دهی",
        Domain.Enums.AuditEventType.QuantityNormalized => "نرمال‌سازی مقدار",
        Domain.Enums.AuditEventType.RecommendationCreated => "ایجاد پیشنهاد",
        Domain.Enums.AuditEventType.ItemSkipped => "کنارگذاری کالا",
        Domain.Enums.AuditEventType.ItemError => "خطای کالا",
        Domain.Enums.AuditEventType.DuplicateRequestDetected => "شناسایی درخواست باز",
        Domain.Enums.AuditEventType.DraftRequestCreated => "ایجاد پیش‌نویس درخواست خرید",
        Domain.Enums.AuditEventType.QuantityOverridden => "تغییر مقدار توسط کاربر",
        Domain.Enums.AuditEventType.RequestSubmitted => "ارسال به گردش‌کار",
        Domain.Enums.AuditEventType.RunFinished => "پایان اجرا",
        _ => "نامشخص"
    };

    public static string ComparisonParameter(ComparisonParameter value) => value switch
    {
        Dtos.ComparisonParameter.ReorderPoint => "نقطه سفارش",
        Dtos.ComparisonParameter.MinimumStock => "حداقل موجودی",
        Dtos.ComparisonParameter.MaximumStock => "حداکثر موجودی",
        Dtos.ComparisonParameter.DesiredStockLevel => "سطح مطلوب",
        _ => "نامشخص"
    };

    /// <summary>ساخت فهرست انتخابی از یک نوع ثابت به همراه نام فارسی</summary>
    public static List<EnumItemDto> ToList<TEnum>(Func<TEnum, string> nameSelector) where TEnum : struct, Enum
        => Enum.GetValues<TEnum>()
            .Select(v => new EnumItemDto
            {
                Value = Convert.ToInt32(v),
                Key = v.ToString(),
                Name = nameSelector(v)
            })
            .ToList();
}
