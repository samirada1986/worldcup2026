using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Enums;
using Xunit;

namespace GngPlus.Replenishment.Tests;

/// <summary>آزمون سرویس درخواست خرید — با تمرکز بر جلوگیری از خرید تکراری</summary>
public class PurchaseRequestServiceTests
{
    private const string User = "کاربر آزمون";

    /// <summary>ساخت یک سناریوی «نیازمند سفارش» و بازگرداندن پیشنهاد آن</summary>
    private static async Task<ReplenishmentRecommendationDto> ArrangeRecommendationAsync(TestContext ctx)
    {
        ctx.AddProduct(1, "KLA-1001", "کاغذ A4");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint, reorderPoint: 200, desired: 800);
        ctx.AddSnapshot(1, onHand: 180, reserved: 30);

        var result = await ctx.Replenishment.CalculateAsync(new ReplenishmentFilterDto(), User);
        return result.Recommendations.Single(r => r.Status == RecommendationStatus.NeedsOrder);
    }

    private static CreateDraftPurchaseRequestDto Draft(
        ReplenishmentRecommendationDto row, decimal? quantity = null,
        string? key = null, string? reason = null)
        => new()
        {
            IdempotencyKey = key,
            AutomationRunId = row.AutomationRunId,
            Lines =
            {
                new DraftPurchaseRequestLineDto
                {
                    RecommendationId = row.Id,
                    RequestedQuantity = quantity ?? row.SuggestedQuantity,
                    QuantityChangeReason = reason
                }
            }
        };

    // ------------------------------------------------------------------
    // ایجاد پیش‌نویس
    // ------------------------------------------------------------------

    [Fact]
    public async Task CreateDraft_CreatesRequestInDraftStatus_WithGeneratedNumber()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);

        var request = await ctx.PurchaseRequests.CreateDraftAsync(Draft(row), User);

        Assert.Equal(PurchaseRequestStatus.Draft, request.Status);
        Assert.StartsWith("PR-", request.RequestNumber);
        Assert.Equal(PurchaseRequestSource.Automation, request.Source);
        Assert.Equal(WorkflowStatus.NotStarted, request.WorkflowStatus);

        var item = Assert.Single(request.Items);
        Assert.Equal(650m, item.RequestedQuantity);
        Assert.Equal(650m, item.SuggestedQuantity);
    }

    [Fact]
    public async Task CreateDraft_IsIdempotent_ForRepeatedCallsWithSameKey()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);

        var first = await ctx.PurchaseRequests.CreateDraftAsync(Draft(row, key: "KEY-1"), User);
        var second = await ctx.PurchaseRequests.CreateDraftAsync(Draft(row, key: "KEY-1"), User);

        Assert.False(first.IsExisting);
        Assert.True(second.IsExisting);
        Assert.Equal(first.Id, second.Id);
        Assert.Equal(first.RequestNumber, second.RequestNumber);
        Assert.Single(await ctx.PurchaseRequests.GetAllAsync());
    }

    [Fact]
    public async Task CreateDraft_RejectsSecondCall_ForRecommendationAlreadyRequested()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);

        await ctx.PurchaseRequests.CreateDraftAsync(Draft(row, key: "KEY-1"), User);

        // همان پیشنهاد، بدون کلید یکتاسازی — نباید درخواست دوم ساخته شود
        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.PurchaseRequests.CreateDraftAsync(Draft(row, key: "KEY-2"), User));

        Assert.Equal(ResultCodes.NoValidRecommendations, error.Code);
        Assert.Single(await ctx.PurchaseRequests.GetAllAsync());
    }

    [Fact]
    public async Task CreateDraft_SkipsLine_WhenBusinessKeyAlreadyHasOpenRequest()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);

        // یک درخواست باز مستقل برای همان کالا/انبار/سایت
        ctx.AddOpenPurchaseRequest(1, quantity: 100);

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.PurchaseRequests.CreateDraftAsync(Draft(row), User));

        Assert.Equal(ResultCodes.NoValidRecommendations, error.Code);
    }

    [Fact]
    public async Task CreateDraft_RejectsEmptySelection()
    {
        using var ctx = new TestContext();

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.PurchaseRequests.CreateDraftAsync(
                new CreateDraftPurchaseRequestDto(), User));

        Assert.Equal(ResultCodes.NoValidRecommendations, error.Code);
    }

    [Fact]
    public async Task CreateDraft_RejectsNonPositiveQuantity()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.PurchaseRequests.CreateDraftAsync(Draft(row, quantity: 0), User));

        Assert.Equal(ResultCodes.ValidationFailed, error.Code);
    }

    // ------------------------------------------------------------------
    // آستانه تغییر مقدار
    // ------------------------------------------------------------------

    [Fact]
    public async Task CreateDraft_RequiresReason_WhenQuantityDeviatesMoreThanThreshold()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.PurchaseRequests.CreateDraftAsync(
                Draft(row, quantity: row.SuggestedQuantity * 2), User));

        Assert.Equal(ResultCodes.ChangeReasonRequired, error.Code);
    }

    [Fact]
    public async Task CreateDraft_AcceptsLargeChange_WhenReasonIsProvided()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);

        var request = await ctx.PurchaseRequests.CreateDraftAsync(
            Draft(row, quantity: 1300m, reason: "افزایش تقاضای فصلی"), User);

        var item = Assert.Single(request.Items);
        Assert.Equal(1300m, item.RequestedQuantity);
        Assert.Equal("افزایش تقاضای فصلی", item.QuantityChangeReason);
    }

    [Fact]
    public async Task CreateDraft_AllowsSmallChange_WithoutReason()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);

        // ۶۵۰ ← ۷۰۰ معادل حدود ۷.۷٪ انحراف
        var request = await ctx.PurchaseRequests.CreateDraftAsync(Draft(row, quantity: 700m), User);

        Assert.Equal(700m, Assert.Single(request.Items).RequestedQuantity);
    }

    [Fact]
    public async Task CreateDraft_RecordsQuantityOverrideInAuditLog()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);

        await ctx.PurchaseRequests.CreateDraftAsync(
            Draft(row, quantity: 1300m, reason: "افزایش تقاضای فصلی"), User);

        var audit = await ctx.Automation.GetAuditAsync(row.AutomationRunId);

        Assert.Contains(audit, a =>
            a.EventType == AuditEventType.QuantityOverridden &&
            a.BeforeValue == "650" && a.AfterValue == "1300");
        Assert.Contains(audit, a => a.EventType == AuditEventType.DraftRequestCreated);
    }

    // ------------------------------------------------------------------
    // ارسال به گردش‌کار
    // ------------------------------------------------------------------

    [Fact]
    public async Task Submit_MovesDraftToSubmitted_AndStartsWorkflow()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);
        var draft = await ctx.PurchaseRequests.CreateDraftAsync(Draft(row), User);

        var submitted = await ctx.PurchaseRequests.SubmitAsync(draft.Id, User);

        Assert.Equal(PurchaseRequestStatus.Submitted, submitted.Status);
        Assert.Equal(WorkflowStatus.Started, submitted.WorkflowStatus);
        Assert.Equal($"WF-{draft.RequestNumber}", submitted.WorkflowInstanceId);
        Assert.NotNull(submitted.SubmittedAt);
    }

    [Fact]
    public async Task Submit_RejectsRequestThatIsNotDraft()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);
        var draft = await ctx.PurchaseRequests.CreateDraftAsync(Draft(row), User);

        await ctx.PurchaseRequests.SubmitAsync(draft.Id, User);

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.PurchaseRequests.SubmitAsync(draft.Id, User));

        Assert.Equal(ResultCodes.InvalidStatusTransition, error.Code);
    }

    [Fact]
    public async Task Submit_RejectsUnknownRequest()
    {
        using var ctx = new TestContext();

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.PurchaseRequests.SubmitAsync(9999, User));

        Assert.Equal(ResultCodes.NotFound, error.Code);
    }

    // ------------------------------------------------------------------
    // اجرای دوباره اتوماسیون
    // ------------------------------------------------------------------

    [Fact]
    public async Task RerunningAutomation_DoesNotRecommendItemsWithOpenDraft()
    {
        using var ctx = new TestContext();
        var row = await ArrangeRecommendationAsync(ctx);
        await ctx.PurchaseRequests.CreateDraftAsync(Draft(row), User);

        var second = await ctx.Replenishment.CalculateAsync(new ReplenishmentFilterDto(), User);
        var rerun = Assert.Single(second.Recommendations);

        Assert.Equal(RecommendationStatus.OpenRequestExists, rerun.Status);
        Assert.Equal(0, second.Summary.RecommendedItems);
    }
}
