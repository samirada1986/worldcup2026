using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Services;
using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Domain.Enums;
using Xunit;

namespace GngPlus.Replenishment.Tests;

/// <summary>آزمون واحد موتور محاسبه — بدون وابستگی به پایگاه داده</summary>
public class ReplenishmentCalculatorTests
{
    private static InventoryOrderParameter Parameter(
        OrderingMethod method = OrderingMethod.ReorderPoint,
        decimal? reorderPoint = null, decimal? minStock = null, decimal? maxStock = null,
        decimal? desired = null, decimal? safetyStock = null,
        decimal? minOrderQty = null, decimal? maxOrderQty = null,
        decimal? batchSize = null, decimal? economicOrderQty = null,
        int? leadTime = null, bool isActive = true,
        DateTime? validFrom = null, DateTime? validTo = null)
        => new()
        {
            OrderingMethod = method,
            ReorderPoint = reorderPoint,
            MinimumStock = minStock,
            MaximumStock = maxStock,
            DesiredStockLevel = desired,
            SafetyStock = safetyStock,
            MinimumOrderQuantity = minOrderQty,
            MaximumOrderQuantity = maxOrderQty,
            OrderBatchSize = batchSize,
            EconomicOrderQuantity = economicOrderQty,
            LeadTimeDays = leadTime,
            IsActive = isActive,
            ValidFrom = validFrom ?? DateTime.UtcNow.Date.AddDays(-10),
            ValidTo = validTo,
            ProductId = 1, WarehouseId = 1, SiteId = 1
        };

    // ------------------------------------------------------------------
    // موجودی موثر
    // ------------------------------------------------------------------

    [Fact]
    public void EffectiveStock_AddsIncoming_AndSubtractsReservedAndOpenRequests()
    {
        var result = ReplenishmentCalculator.CalculateEffectiveStock(
            onHandQuantity: 100,
            confirmedIncomingQuantity: 40,
            reservedQuantity: 25,
            openPurchaseRequestQuantity: 15);

        Assert.Equal(100m, result);
    }

    // ------------------------------------------------------------------
    // میانگین مصرف روزانه
    // ------------------------------------------------------------------

    [Fact]
    public void AverageDailyConsumption_DividesTotalByWindowDays()
        => Assert.Equal(20m, ReplenishmentCalculator.CalculateAverageDailyConsumption(600m, 30));

    [Fact]
    public void AverageDailyConsumption_ReturnsZero_WhenWindowIsNotPositive()
        => Assert.Equal(0m, ReplenishmentCalculator.CalculateAverageDailyConsumption(600m, 0));

    // ------------------------------------------------------------------
    // قاعده ۱ — نقطه سفارش
    // ------------------------------------------------------------------

    [Fact]
    public void ReorderPointRule_Triggers_WhenStockReachesReorderPoint()
    {
        var parameter = Parameter(reorderPoint: 20, desired: 50);

        var result = ReplenishmentCalculator.ApplyReorderPointRule(parameter, effectiveStock: 12);

        Assert.True(result.Triggered);
        Assert.Equal(38m, result.RawQuantity);
        Assert.Equal(ResultCodes.BelowReorderPoint, result.Code);
    }

    [Fact]
    public void ReorderPointRule_TriggersOnEquality()
    {
        var parameter = Parameter(reorderPoint: 20, desired: 50);

        Assert.True(ReplenishmentCalculator.ApplyReorderPointRule(parameter, 20).Triggered);
    }

    [Fact]
    public void ReorderPointRule_DoesNotTrigger_WhenStockIsAbovePoint()
    {
        var parameter = Parameter(reorderPoint: 20, desired: 50);

        var result = ReplenishmentCalculator.ApplyReorderPointRule(parameter, effectiveStock: 21);

        Assert.False(result.Triggered);
        Assert.Equal(ResultCodes.StockSufficient, result.Code);
    }

    [Fact]
    public void ReorderPointRule_FallsBackToMaximumStock_WhenDesiredLevelIsEmpty()
    {
        var parameter = Parameter(reorderPoint: 20, maxStock: 80);

        var result = ReplenishmentCalculator.ApplyReorderPointRule(parameter, effectiveStock: 10);

        Assert.True(result.Triggered);
        Assert.Equal(70m, result.RawQuantity);
    }

    [Fact]
    public void ReorderPointRule_ReturnsError_WhenNoTargetLevelIsConfigured()
    {
        var parameter = Parameter(reorderPoint: 20);

        var result = ReplenishmentCalculator.ApplyReorderPointRule(parameter, effectiveStock: 10);

        Assert.False(result.Triggered);
        Assert.Equal(EvaluationOutcome.Error, result.Outcome);
        Assert.Equal(ResultCodes.TargetLevelMissing, result.Code);
    }

    // ------------------------------------------------------------------
    // قاعده ۲ — حداقل / حداکثر
    // ------------------------------------------------------------------

    [Fact]
    public void MinMaxRule_Triggers_WhenStockIsBelowMinimum()
    {
        var parameter = Parameter(OrderingMethod.MinMax, minStock: 100, maxStock: 400);

        var result = ReplenishmentCalculator.ApplyMinMaxRule(parameter, effectiveStock: 70);

        Assert.True(result.Triggered);
        Assert.Equal(330m, result.RawQuantity);
        Assert.Equal(ResultCodes.BelowMinimumStock, result.Code);
    }

    [Fact]
    public void MinMaxRule_DoesNotTrigger_WhenStockEqualsMinimum()
    {
        var parameter = Parameter(OrderingMethod.MinMax, minStock: 100, maxStock: 400);

        Assert.False(ReplenishmentCalculator.ApplyMinMaxRule(parameter, 100).Triggered);
    }

    // ------------------------------------------------------------------
    // قاعده ۳ — سطح مطلوب
    // ------------------------------------------------------------------

    [Fact]
    public void DesiredLevelRule_Triggers_WhenStockIsBelowDesiredLevel()
    {
        var parameter = Parameter(OrderingMethod.DesiredLevel, desired: 1200);

        var result = ReplenishmentCalculator.ApplyDesiredLevelRule(parameter, effectiveStock: 750);

        Assert.True(result.Triggered);
        Assert.Equal(450m, result.RawQuantity);
    }

    // ------------------------------------------------------------------
    // قاعده ۴ — بر اساس مصرف
    // ------------------------------------------------------------------

    [Fact]
    public void ConsumptionBasedRule_UsesForecastDemandPlusSafetyStock()
    {
        var parameter = Parameter(OrderingMethod.ConsumptionBased, safetyStock: 100, leadTime: 14);

        // پیش‌بینی تقاضا: ۲۰ × ۱۴ = ۲۸۰ ← موجودی هدف: ۳۸۰ ← نیاز: ۳۸۰ − ۱۳۰ = ۲۵۰
        var result = ReplenishmentCalculator.ApplyConsumptionBasedRule(
            parameter, effectiveStock: 130, averageDailyConsumption: 20);

        Assert.True(result.Triggered);
        Assert.Equal(250m, result.RawQuantity);
        Assert.Equal(380m, result.TargetLevel);
    }

    [Fact]
    public void ConsumptionBasedRule_ReturnsError_WhenLeadTimeIsMissing()
    {
        var parameter = Parameter(OrderingMethod.ConsumptionBased, safetyStock: 100);

        var result = ReplenishmentCalculator.ApplyConsumptionBasedRule(parameter, 10, 20);

        Assert.Equal(EvaluationOutcome.Error, result.Outcome);
        Assert.Equal(ResultCodes.LeadTimeMissing, result.Code);
    }

    [Fact]
    public void ConsumptionBasedRule_FallsBackToSafetyStock_WhenThereIsNoConsumption()
    {
        var parameter = Parameter(OrderingMethod.ConsumptionBased, safetyStock: 80, leadTime: 30);

        var result = ReplenishmentCalculator.ApplyConsumptionBasedRule(
            parameter, effectiveStock: 50, averageDailyConsumption: 0);

        Assert.True(result.Triggered);
        Assert.Equal(30m, result.RawQuantity);
    }

    // ------------------------------------------------------------------
    // نرمال‌سازی مقدار
    // ------------------------------------------------------------------

    [Fact]
    public void Normalize_ReturnsSkip_WhenQuantityIsNotPositive()
    {
        var result = ReplenishmentCalculator.Normalize(Parameter(), rawQuantity: 0);

        Assert.Equal(EvaluationOutcome.Skip, result.Outcome);
        Assert.Equal(0m, result.Quantity);
        Assert.Equal(ResultCodes.NonPositiveSuggestion, result.Code);
    }

    [Fact]
    public void Normalize_RaisesQuantity_ToMinimumOrderQuantity()
    {
        var result = ReplenishmentCalculator.Normalize(Parameter(minOrderQty: 500), rawQuantity: 60);

        Assert.Equal(500m, result.Quantity);
        Assert.Equal(EvaluationOutcome.Proceed, result.Outcome);
    }

    [Fact]
    public void Normalize_RoundsUp_ToNearestBatchSize()
    {
        // نمونه مستند نیازمندی: ۲۳ با اندازه انباشته ۱۰ ← ۳۰
        var result = ReplenishmentCalculator.Normalize(Parameter(batchSize: 10), rawQuantity: 23);

        Assert.Equal(30m, result.Quantity);
    }

    [Fact]
    public void Normalize_LeavesQuantityUnchanged_WhenAlreadyOnBatchBoundary()
        => Assert.Equal(30m, ReplenishmentCalculator.Normalize(Parameter(batchSize: 10), 30).Quantity);

    [Fact]
    public void Normalize_AppliesMinimumOrderQuantity_BeforeBatchRounding()
    {
        var result = ReplenishmentCalculator.Normalize(
            Parameter(minOrderQty: 45, batchSize: 20), rawQuantity: 10);

        // ۱۰ ← حداقل سفارش ۴۵ ← گرد شده به ۶۰
        Assert.Equal(60m, result.Quantity);
    }

    [Fact]
    public void Normalize_RaisesQuantity_ToEconomicOrderQuantity()
        => Assert.Equal(200m,
            ReplenishmentCalculator.Normalize(Parameter(economicOrderQty: 200), 50).Quantity);

    [Fact]
    public void Normalize_MarksForReview_WhenAboveMaximumOrderQuantity_WithoutTruncating()
    {
        var result = ReplenishmentCalculator.Normalize(Parameter(maxOrderQty: 500), rawQuantity: 1400);

        Assert.Equal(EvaluationOutcome.RequireReview, result.Outcome);
        Assert.Equal(ResultCodes.AboveMaximumOrderQuantity, result.Code);

        // مقدار بریده نمی‌شود؛ فقط برای بررسی کاربر علامت می‌خورد
        Assert.Equal(1400m, result.Quantity);
    }

    [Fact]
    public void RoundUpToBatchSize_IgnoresNonPositiveBatchSize()
        => Assert.Equal(23m, ReplenishmentCalculator.RoundUpToBatchSize(23m, 0m));

    // ------------------------------------------------------------------
    // قواعد استثنا
    // ------------------------------------------------------------------

    [Fact]
    public void CheckParameterActive_SkipsInactiveParameter()
    {
        var result = ReplenishmentCalculator.CheckParameterActive(Parameter(isActive: false));

        Assert.Equal(EvaluationOutcome.Skip, result.Outcome);
        Assert.Equal(ResultCodes.ParameterInactive, result.Code);
    }

    [Fact]
    public void CheckParameterValidity_SkipsExpiredParameter()
    {
        var today = DateTime.UtcNow.Date;
        var parameter = Parameter(validFrom: today.AddDays(-400), validTo: today.AddDays(-30));

        var result = ReplenishmentCalculator.CheckParameterValidity(parameter, today);

        Assert.Equal(EvaluationOutcome.Skip, result.Outcome);
        Assert.Equal(ResultCodes.ParameterExpired, result.Code);
    }

    [Fact]
    public void CheckParameterValidity_SkipsParameterThatIsNotYetValid()
    {
        var today = DateTime.UtcNow.Date;
        var parameter = Parameter(validFrom: today.AddDays(10));

        Assert.Equal(ResultCodes.ParameterNotYetValid,
            ReplenishmentCalculator.CheckParameterValidity(parameter, today).Code);
    }

    [Fact]
    public void CheckMinMaxConfiguration_FailsWhenMaximumIsBelowMinimum()
    {
        var result = ReplenishmentCalculator.CheckMinMaxConfiguration(
            Parameter(minStock: 500, maxStock: 200));

        Assert.Equal(EvaluationOutcome.Error, result.Outcome);
        Assert.Equal(ResultCodes.InvalidMinMax, result.Code);
    }

    [Fact]
    public void CheckOrderQuantityRange_FailsWhenMaximumOrderIsBelowMinimumOrder()
        => Assert.Equal(ResultCodes.InvalidOrderQuantityRange,
            ReplenishmentCalculator.CheckOrderQuantityRange(
                Parameter(minOrderQty: 100, maxOrderQty: 50)).Code);

    [Fact]
    public void CheckInventorySanity_FailsOnNegativeOnHandQuantity()
    {
        var result = ReplenishmentCalculator.CheckInventorySanity(-15, 0, 0);

        Assert.Equal(EvaluationOutcome.Error, result.Outcome);
        Assert.Equal(ResultCodes.NegativeInventory, result.Code);
    }

    [Fact]
    public void CheckParameterExists_FailsWhenParameterIsMissing()
        => Assert.Equal(ResultCodes.ParameterMissing,
            ReplenishmentCalculator.CheckParameterExists(null).Code);

    // ------------------------------------------------------------------
    // آستانه تغییر مقدار توسط کاربر
    // ------------------------------------------------------------------

    [Theory]
    [InlineData(100, 100, false)]   // بدون تغییر
    [InlineData(100, 115, false)]   // ۱۵٪ ← زیر آستانه
    [InlineData(100, 120, false)]   // دقیقاً ۲۰٪ ← هنوز مجاز
    [InlineData(100, 121, true)]    // بیش از ۲۰٪
    [InlineData(100, 70, true)]     // کاهش ۳۰٪
    public void RequiresChangeReason_UsesTwentyPercentThreshold(
        decimal suggested, decimal requested, bool expected)
        => Assert.Equal(expected, ReplenishmentCalculator.RequiresChangeReason(suggested, requested));
}
