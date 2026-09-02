namespace GngPlus.Replenishment.Domain.Enums;

/// <summary>نحوه سفارش‌دهی — روش محاسبه نیاز سفارش</summary>
public enum OrderingMethod
{
    /// <summary>نقطه سفارش</summary>
    ReorderPoint = 1,

    /// <summary>حداقل / حداکثر</summary>
    MinMax = 2,

    /// <summary>سطح مطلوب</summary>
    DesiredLevel = 3,

    /// <summary>بر اساس مصرف</summary>
    ConsumptionBased = 4
}

/// <summary>نتیجه ارزیابی قواعد کنترلی — به جای بازگرداندن رشته خام</summary>
public enum EvaluationOutcome
{
    /// <summary>ادامه محاسبه بدون اخطار</summary>
    Proceed = 1,

    /// <summary>محاسبه ادامه می‌یابد ولی اخطار ثبت می‌شود</summary>
    Warning = 2,

    /// <summary>پیشنهاد ایجاد می‌شود ولی نیازمند بررسی کاربر است</summary>
    RequireReview = 3,

    /// <summary>کالا از چرخه پیشنهاد کنار گذاشته می‌شود (وضعیت عادی)</summary>
    Skip = 4,

    /// <summary>خطای تنظیمات یا داده — کالا قابل پردازش نیست</summary>
    Error = 5
}

/// <summary>وضعیت پیشنهاد سفارش</summary>
public enum RecommendationStatus
{
    /// <summary>نیازمند سفارش</summary>
    NeedsOrder = 1,

    /// <summary>نیازمند بررسی</summary>
    NeedsReview = 2,

    /// <summary>درخواست باز موجود است</summary>
    OpenRequestExists = 3,

    /// <summary>بدون نیاز</summary>
    NoNeed = 4,

    /// <summary>خطای تنظیمات</summary>
    ConfigurationError = 5,

    /// <summary>پیش‌نویس ایجاد شد</summary>
    DraftCreated = 6
}

/// <summary>وضعیت درخواست خرید</summary>
public enum PurchaseRequestStatus
{
    /// <summary>پیش‌نویس</summary>
    Draft = 1,

    /// <summary>ارسال‌شده به گردش‌کار</summary>
    Submitted = 2,

    /// <summary>در حال بررسی</summary>
    InProgress = 3,

    /// <summary>تایید شده</summary>
    Approved = 4,

    /// <summary>رد شده</summary>
    Rejected = 5,

    /// <summary>ابطال شده</summary>
    Cancelled = 6,

    /// <summary>بسته شده</summary>
    Closed = 7
}

/// <summary>منبع ایجاد درخواست خرید</summary>
public enum PurchaseRequestSource
{
    /// <summary>ثبت دستی کاربر</summary>
    Manual = 1,

    /// <summary>اتوماسیون سفارش‌دهی</summary>
    Automation = 2
}

/// <summary>نوع اجرای اتوماسیون</summary>
public enum AutomationTriggerType
{
    /// <summary>دستی</summary>
    Manual = 1,

    /// <summary>زمان‌بندی روزانه</summary>
    DailySchedule = 2
}

/// <summary>وضعیت اجرای اتوماسیون</summary>
public enum AutomationRunStatus
{
    /// <summary>در حال اجرا</summary>
    Running = 1,

    /// <summary>خاتمه یافته</summary>
    Completed = 2,

    /// <summary>ناموفق</summary>
    Failed = 3
}

/// <summary>نوع رویداد ثبت‌شده در تاریخچه اجرا</summary>
public enum AuditEventType
{
    RunStarted = 1,
    ParameterEvaluated = 2,
    StockCalculated = 3,
    RuleApplied = 4,
    QuantityNormalized = 5,
    RecommendationCreated = 6,
    ItemSkipped = 7,
    ItemError = 8,
    DuplicateRequestDetected = 9,
    DraftRequestCreated = 10,
    QuantityOverridden = 11,
    RequestSubmitted = 12,
    RunFinished = 13
}

/// <summary>وضعیت نمونه گردش‌کار شبیه‌سازی‌شده</summary>
public enum WorkflowStatus
{
    NotStarted = 0,
    Started = 1,
    InReview = 2,
    Completed = 3
}
