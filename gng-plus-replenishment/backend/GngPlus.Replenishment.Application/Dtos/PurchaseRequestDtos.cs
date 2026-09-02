using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Application.Dtos;

/// <summary>ورودی ایجاد پیش‌نویس درخواست خرید</summary>
public class CreateDraftPurchaseRequestDto
{
    /// <summary>
    /// کلید یکتاسازی — از فرانت‌اند ارسال می‌شود تا فراخوانی تکراری،
    /// درخواست خرید تکراری ایجاد نکند.
    /// </summary>
    public string? IdempotencyKey { get; set; }

    public int AutomationRunId { get; set; }

    public List<DraftPurchaseRequestLineDto> Lines { get; set; } = new();
}

/// <summary>یک ردیف انتخاب‌شده برای ایجاد پیش‌نویس</summary>
public class DraftPurchaseRequestLineDto
{
    /// <summary>شناسه پیشنهاد</summary>
    public int RecommendationId { get; set; }

    /// <summary>مقدار درخواست تایید/اصلاح‌شده توسط کاربر</summary>
    public decimal RequestedQuantity { get; set; }

    /// <summary>طبقه‌بندی درخواست</summary>
    public int? RequestClassificationId { get; set; }

    /// <summary>دلیل تغییر مقدار پیشنهادی — در انحراف بیش از آستانه الزامی است</summary>
    public string? QuantityChangeReason { get; set; }
}

/// <summary>درخواست خرید — خروجی</summary>
public class PurchaseRequestDto
{
    public int Id { get; set; }
    public string RequestNumber { get; set; } = string.Empty;
    public PurchaseRequestStatus Status { get; set; }
    public string StatusName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;
    public PurchaseRequestSource Source { get; set; }
    public string SourceName { get; set; } = string.Empty;
    public int? AutomationRunId { get; set; }
    public WorkflowStatus WorkflowStatus { get; set; }
    public string WorkflowStatusName { get; set; } = string.Empty;
    public string? WorkflowInstanceId { get; set; }
    public List<PurchaseRequestItemDto> Items { get; set; } = new();

    /// <summary>
    /// ردیف‌هایی که به دلیل وجود درخواست خرید باز، از پیش‌نویس حذف شده‌اند.
    /// </summary>
    public List<SkippedLineDto> SkippedLines { get; set; } = new();

    /// <summary>آیا این پاسخ، درخواست موجود قبلی است (فراخوانی تکراری)</summary>
    public bool IsExisting { get; set; }
}

/// <summary>ردیف درخواست خرید — خروجی</summary>
public class PurchaseRequestItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string ProductCode { get; set; } = string.Empty;
    public int WarehouseId { get; set; }
    public string WarehouseName { get; set; } = string.Empty;
    public int SiteId { get; set; }
    public string SiteName { get; set; } = string.Empty;
    public decimal RequestedQuantity { get; set; }
    public decimal SuggestedQuantity { get; set; }
    public int UnitOfMeasureId { get; set; }
    public string UnitOfMeasureName { get; set; } = string.Empty;
    public int? RequestClassificationId { get; set; }
    public string? RequestClassificationName { get; set; }
    public string? QuantityChangeReason { get; set; }
}

/// <summary>ردیف کنارگذاشته‌شده به همراه دلیل</summary>
public class SkippedLineDto
{
    public int RecommendationId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
