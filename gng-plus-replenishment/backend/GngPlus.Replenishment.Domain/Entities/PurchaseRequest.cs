using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Domain.Entities;

/// <summary>درخواست خرید</summary>
public class PurchaseRequest
{
    public int Id { get; set; }

    /// <summary>شماره درخواست — مثال: PR-1405-000123</summary>
    public string RequestNumber { get; set; } = string.Empty;

    public PurchaseRequestStatus Status { get; set; } = PurchaseRequestStatus.Draft;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? SubmittedAt { get; set; }
    public string CreatedBy { get; set; } = string.Empty;

    public PurchaseRequestSource Source { get; set; } = PurchaseRequestSource.Automation;

    /// <summary>شناسه اجرای اتوماسیونی که این درخواست از آن ایجاد شده است</summary>
    public int? AutomationRunId { get; set; }
    public AutomationRun? AutomationRun { get; set; }

    /// <summary>نوع درخواست</summary>
    public int? RequestTypeId { get; set; }

    /// <summary>
    /// کلید یکتاسازی عملیات ایجاد پیش‌نویس.
    /// تضمین می‌کند ارسال دوباره همان فراخوانی، درخواست تکراری نسازد.
    /// </summary>
    public string? IdempotencyKey { get; set; }

    /// <summary>وضعیت گردش‌کار شبیه‌سازی‌شده</summary>
    public WorkflowStatus WorkflowStatus { get; set; } = WorkflowStatus.NotStarted;

    /// <summary>شناسه نمونه گردش‌کار شبیه‌سازی‌شده</summary>
    public string? WorkflowInstanceId { get; set; }

    public List<PurchaseRequestItem> Items { get; set; } = new();

    /// <summary>وضعیت‌هایی که یک درخواست را «باز» می‌کنند و مانع سفارش تکراری می‌شوند</summary>
    public static readonly PurchaseRequestStatus[] OpenStatuses =
    {
        PurchaseRequestStatus.Draft,
        PurchaseRequestStatus.Submitted,
        PurchaseRequestStatus.InProgress,
        PurchaseRequestStatus.Approved
    };

    public static bool IsOpenStatus(PurchaseRequestStatus status) => OpenStatuses.Contains(status);
}

/// <summary>ردیف درخواست خرید</summary>
public class PurchaseRequestItem
{
    public int Id { get; set; }
    public int PurchaseRequestId { get; set; }
    public PurchaseRequest? PurchaseRequest { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }
    public int WarehouseId { get; set; }
    public Warehouse? Warehouse { get; set; }
    public int SiteId { get; set; }
    public Site? Site { get; set; }

    /// <summary>مقدار درخواست (قابل ویرایش توسط کاربر)</summary>
    public decimal RequestedQuantity { get; set; }

    /// <summary>مقدار پیشنهادی محاسبه‌شده توسط سرویس</summary>
    public decimal SuggestedQuantity { get; set; }

    public int UnitOfMeasureId { get; set; }
    public UnitOfMeasure? UnitOfMeasure { get; set; }

    /// <summary>طبقه‌بندی درخواست</summary>
    public int? RequestClassificationId { get; set; }

    /// <summary>شناسه پیشنهادی که این ردیف از آن ساخته شده است</summary>
    public int? ReplenishmentRecommendationId { get; set; }

    /// <summary>دلیل تغییر مقدار پیشنهادی — در صورت انحراف بیش از حد آستانه الزامی است</summary>
    public string? QuantityChangeReason { get; set; }
}

/// <summary>نمونه گردش‌کار شبیه‌سازی‌شده برای نمونه اولیه</summary>
public class WorkflowInstance
{
    public int Id { get; set; }
    public string InstanceKey { get; set; } = string.Empty;
    public int PurchaseRequestId { get; set; }
    public PurchaseRequest? PurchaseRequest { get; set; }
    public WorkflowStatus Status { get; set; } = WorkflowStatus.Started;
    public string CurrentStep { get; set; } = string.Empty;
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
}
