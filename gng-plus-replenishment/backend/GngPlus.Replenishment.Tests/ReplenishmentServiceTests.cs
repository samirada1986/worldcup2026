using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Enums;
using Xunit;

namespace GngPlus.Replenishment.Tests;

/// <summary>آزمون سرویس محاسبه نیاز سفارش روی پایگاه داده درون‌حافظه</summary>
public class ReplenishmentServiceTests
{
    private const string User = "کاربر آزمون";

    private static async Task<ReplenishmentRecommendationDto> SingleAsync(TestContext ctx)
    {
        var result = await ctx.Replenishment.CalculateAsync(new ReplenishmentFilterDto(), User);
        return Assert.Single(result.Recommendations);
    }

    // ------------------------------------------------------------------
    // قواعد سفارش‌دهی از انتها تا انتها
    // ------------------------------------------------------------------

    [Fact]
    public async Task ReorderPoint_ProducesRecommendation_WhenStockIsBelowPoint()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1001", "کاغذ A4");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint, reorderPoint: 200, desired: 800);
        ctx.AddSnapshot(1, onHand: 180, reserved: 30);

        var row = await SingleAsync(ctx);

        Assert.Equal(150m, row.EffectiveStock);
        Assert.Equal(650m, row.SuggestedQuantity);
        Assert.Equal(RecommendationStatus.NeedsOrder, row.Status);
        Assert.True(row.IsSelectable);
    }

    [Fact]
    public async Task ReorderPoint_ProducesNoNeed_WhenStockIsSufficient()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1003", "تونر پرینتر");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint, reorderPoint: 20, desired: 80);
        ctx.AddSnapshot(1, onHand: 95, reserved: 5);

        var row = await SingleAsync(ctx);

        Assert.Equal(RecommendationStatus.NoNeed, row.Status);
        Assert.Equal(0m, row.SuggestedQuantity);
        Assert.False(row.IsSelectable);
    }

    [Fact]
    public async Task MinMax_ProducesRecommendation_AndRoundsToBatchSize()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1010", "لیبل چاپ");
        ctx.AddParameter(1, OrderingMethod.MinMax, minStock: 30, maxStock: 50, batchSize: 10);
        ctx.AddSnapshot(1, onHand: 30, reserved: 3);

        var row = await SingleAsync(ctx);

        // موثر ۲۷ ← نیاز خام ۲۳ ← گرد شده به ۳۰
        Assert.Equal(27m, row.EffectiveStock);
        Assert.Equal(30m, row.SuggestedQuantity);
        Assert.Equal(RecommendationStatus.NeedsOrder, row.Status);
    }

    [Fact]
    public async Task ConsumptionBased_UsesAverageDailyConsumptionOverConfiguredWindow()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1004", "دستکش ایمنی");
        ctx.AddParameter(1, OrderingMethod.ConsumptionBased,
            safetyStock: 100, leadTime: 14, avgDays: 30);
        ctx.AddSnapshot(1, onHand: 150, reserved: 20);
        ctx.AddDailyConsumption(1, dailyQuantity: 20, days: 60);

        var row = await SingleAsync(ctx);

        Assert.Equal(20m, row.AverageDailyConsumption);
        Assert.Equal(130m, row.EffectiveStock);
        Assert.Equal(250m, row.SuggestedQuantity);
        Assert.Equal(RecommendationStatus.NeedsOrder, row.Status);
    }

    [Fact]
    public async Task MinimumOrderQuantity_RaisesSuggestedQuantity()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1015", "واشر فلزی");
        ctx.AddParameter(1, OrderingMethod.MinMax,
            minStock: 1000, maxStock: 1050, minOrderQty: 500);
        ctx.AddSnapshot(1, onHand: 990);

        var row = await SingleAsync(ctx);

        // نیاز خام ۶۰ ← افزایش به مقدار حداقل سفارش ۵۰۰
        Assert.Equal(500m, row.SuggestedQuantity);
    }

    [Fact]
    public async Task MaximumOrderQuantity_MarksRowForReview_InsteadOfTruncating()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1009", "مواد شوینده");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint,
            reorderPoint: 200, desired: 1500, maxOrderQty: 500);
        ctx.AddSnapshot(1, onHand: 120, reserved: 20);

        var row = await SingleAsync(ctx);

        Assert.Equal(RecommendationStatus.NeedsReview, row.Status);
        Assert.Equal(1400m, row.SuggestedQuantity);
        Assert.Equal(ResultCodes.AboveMaximumOrderQuantity, row.ReasonCode);
        Assert.True(row.IsSelectable);
    }

    [Fact]
    public async Task EconomicOrderQuantity_IsAppliedAsFloor()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1020", "شیلنگ فشار قوی");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint,
            reorderPoint: 100, desired: 140, economicOrderQty: 200);
        ctx.AddSnapshot(1, onHand: 90);

        Assert.Equal(200m, (await SingleAsync(ctx)).SuggestedQuantity);
    }

    // ------------------------------------------------------------------
    // قواعد استثنا
    // ------------------------------------------------------------------

    [Fact]
    public async Task ExistingOpenRequest_BlocksNewRecommendation()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1005", "روغن صنعتی");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint, reorderPoint: 300, desired: 900);
        ctx.AddSnapshot(1, onHand: 250);
        ctx.AddOpenPurchaseRequest(1, quantity: 700);

        var row = await SingleAsync(ctx);

        Assert.Equal(RecommendationStatus.OpenRequestExists, row.Status);
        Assert.Equal(700m, row.ExistingOpenRequestQuantity);
        Assert.Equal(0m, row.SuggestedQuantity);
        Assert.False(row.IsSelectable);
    }

    [Fact]
    public async Task ClosedRequest_DoesNotBlockRecommendation()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1005", "روغن صنعتی");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint, reorderPoint: 300, desired: 900);
        ctx.AddSnapshot(1, onHand: 250);
        ctx.AddOpenPurchaseRequest(1, 700, PurchaseRequestStatus.Cancelled);

        var row = await SingleAsync(ctx);

        Assert.Equal(RecommendationStatus.NeedsOrder, row.Status);
        Assert.Equal(0m, row.ExistingOpenRequestQuantity);
        Assert.Equal(650m, row.SuggestedQuantity);
    }

    [Fact]
    public async Task ExpiredParameter_IsSkipped()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1007", "فیوز");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint, reorderPoint: 100, desired: 400,
            validFrom: ctx.Today.AddDays(-400), validTo: ctx.Today.AddDays(-30));
        ctx.AddSnapshot(1, onHand: 40);

        var row = await SingleAsync(ctx);

        Assert.Equal(RecommendationStatus.NoNeed, row.Status);
        Assert.Equal(ResultCodes.ParameterExpired, row.ReasonCode);
        Assert.False(row.IsSelectable);
    }

    [Fact]
    public async Task InactiveParameter_IsSkipped()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1011", "چسب نواری");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint,
            reorderPoint: 50, desired: 150, isActive: false);
        ctx.AddSnapshot(1, onHand: 5);

        var row = await SingleAsync(ctx);

        Assert.Equal(RecommendationStatus.NoNeed, row.Status);
        Assert.Equal(ResultCodes.ParameterInactive, row.ReasonCode);
    }

    [Fact]
    public async Task InvalidMinMaxConfiguration_ProducesConfigurationError()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1006", "پیچ صنعتی");
        ctx.AddParameter(1, OrderingMethod.MinMax, minStock: 500, maxStock: 200);
        ctx.AddSnapshot(1, onHand: 300);

        var row = await SingleAsync(ctx);

        Assert.Equal(RecommendationStatus.ConfigurationError, row.Status);
        Assert.Equal(ResultCodes.InvalidMinMax, row.ReasonCode);
    }

    [Fact]
    public async Task ConsumptionBasedWithoutLeadTime_ProducesConfigurationError()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1012", "ماسک تنفسی");
        ctx.AddParameter(1, OrderingMethod.ConsumptionBased, safetyStock: 200, leadTime: null);
        ctx.AddSnapshot(1, onHand: 300);

        Assert.Equal(ResultCodes.LeadTimeMissing, (await SingleAsync(ctx)).ReasonCode);
    }

    [Fact]
    public async Task NegativeInventory_ProducesConfigurationError()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1017", "باتری صنعتی");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint, reorderPoint: 30, desired: 120);
        ctx.AddSnapshot(1, onHand: -15);

        Assert.Equal(ResultCodes.NegativeInventory, (await SingleAsync(ctx)).ReasonCode);
    }

    [Fact]
    public async Task MissingParameter_ProducesConfigurationError()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1010", "لیبل چاپ");
        ctx.AddSnapshot(1, onHand: 12); // موجودی بدون پارامتر سفارش‌دهی

        var row = await SingleAsync(ctx);

        Assert.Equal(RecommendationStatus.ConfigurationError, row.Status);
        Assert.Equal(ResultCodes.ParameterMissing, row.ReasonCode);
    }

    // ------------------------------------------------------------------
    // فیلترها و خلاصه اجرا
    // ------------------------------------------------------------------

    [Fact]
    public async Task Summary_CountsEachOutcomeCategory()
    {
        using var ctx = new TestContext();

        ctx.AddProduct(1, "KLA-0001", "نیازمند سفارش");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint, reorderPoint: 200, desired: 800);
        ctx.AddSnapshot(1, onHand: 100);

        ctx.AddProduct(2, "KLA-0002", "بدون نیاز");
        ctx.AddParameter(2, OrderingMethod.ReorderPoint, reorderPoint: 20, desired: 80);
        ctx.AddSnapshot(2, onHand: 95);

        ctx.AddProduct(3, "KLA-0003", "خطای تنظیمات");
        ctx.AddParameter(3, OrderingMethod.MinMax, minStock: 500, maxStock: 200);
        ctx.AddSnapshot(3, onHand: 300);

        ctx.AddProduct(4, "KLA-0004", "نیازمند بررسی");
        ctx.AddParameter(4, OrderingMethod.ReorderPoint,
            reorderPoint: 200, desired: 1500, maxOrderQty: 500);
        ctx.AddSnapshot(4, onHand: 100);

        var result = await ctx.Replenishment.CalculateAsync(new ReplenishmentFilterDto(), User);

        Assert.Equal(4, result.Summary.TotalItems);
        Assert.Equal(1, result.Summary.RecommendedItems);
        Assert.Equal(1, result.Summary.ReviewItems);
        Assert.Equal(1, result.Summary.SkippedItems);
        Assert.Equal(1, result.Summary.ErrorItems);
        Assert.Equal(AutomationRunStatus.Completed, result.Summary.Status);
    }

    [Fact]
    public async Task Filter_LimitsResultsToRequestedProduct()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-0001", "کالای اول");
        ctx.AddParameter(1, OrderingMethod.ReorderPoint, reorderPoint: 200, desired: 800);
        ctx.AddSnapshot(1, onHand: 100);

        ctx.AddProduct(2, "KLA-0002", "کالای دوم");
        ctx.AddParameter(2, OrderingMethod.ReorderPoint, reorderPoint: 200, desired: 800);
        ctx.AddSnapshot(2, onHand: 100);

        var result = await ctx.Replenishment.CalculateAsync(
            new ReplenishmentFilterDto { ProductId = 2 }, User);

        var row = Assert.Single(result.Recommendations);
        Assert.Equal("KLA-0002", row.ProductCode);
    }

    [Fact]
    public async Task AuditLog_RecordsCalculationStepsForEachItem()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1010", "لیبل چاپ");
        ctx.AddParameter(1, OrderingMethod.MinMax, minStock: 30, maxStock: 50, batchSize: 10);
        ctx.AddSnapshot(1, onHand: 30, reserved: 3);

        var result = await ctx.Replenishment.CalculateAsync(new ReplenishmentFilterDto(), User);
        var audit = await ctx.Automation.GetAuditAsync(result.Summary.AutomationRunId);

        Assert.Contains(audit, a => a.EventType == AuditEventType.RunStarted);
        Assert.Contains(audit, a => a.EventType == AuditEventType.StockCalculated);
        Assert.Contains(audit, a => a.EventType == AuditEventType.RuleApplied);
        Assert.Contains(audit, a => a.EventType == AuditEventType.QuantityNormalized);
        Assert.Contains(audit, a => a.EventType == AuditEventType.RecommendationCreated);
        Assert.Contains(audit, a => a.EventType == AuditEventType.RunFinished);
    }
}
