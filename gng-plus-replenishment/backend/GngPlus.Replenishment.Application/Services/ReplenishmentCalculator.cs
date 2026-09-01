using System.Globalization;
using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Application.Services;

/// <summary>نتیجه اعمال یک قاعده سفارش‌دهی</summary>
public sealed record RuleEvaluation(
    bool Triggered,
    decimal RawQuantity,
    decimal? TargetLevel,
    string Code,
    string Message,
    EvaluationOutcome Outcome = EvaluationOutcome.Proceed);

/// <summary>نتیجه نرمال‌سازی مقدار پیشنهادی</summary>
public sealed record NormalizationResult(
    decimal Quantity,
    EvaluationOutcome Outcome,
    string Code,
    string Message,
    IReadOnlyList<string> AppliedSteps);

/// <summary>
/// موتور محاسبه نیاز سفارش.
/// تمام قواعد به صورت متدهای کوچک و مستقل پیاده‌سازی شده‌اند تا واحد‌آزمون‌پذیر باشند.
/// این کلاس هیچ وابستگی به پایگاه داده یا فریم‌ورک ندارد.
/// </summary>
public static class ReplenishmentCalculator
{
    private static readonly CultureInfo Inv = CultureInfo.InvariantCulture;

    private static string N(decimal value) =>
        value.ToString("0.##", Inv);

    // ------------------------------------------------------------------
    // ۱. موجودی موثر
    // ------------------------------------------------------------------

    /// <summary>
    /// موجودی موثر = موجودی فعلی + ورودی قطعی - موجودی رزرو شده - مقدار درخواست خرید باز
    /// کسر «درخواست خرید باز» از خرید تکراری جلوگیری می‌کند.
    /// </summary>
    public static decimal CalculateEffectiveStock(
        decimal onHandQuantity,
        decimal confirmedIncomingQuantity,
        decimal reservedQuantity,
        decimal openPurchaseRequestQuantity)
        => onHandQuantity
           + confirmedIncomingQuantity
           - reservedQuantity
           - openPurchaseRequestQuantity;

    // ------------------------------------------------------------------
    // ۲. میانگین مصرف روزانه
    // ------------------------------------------------------------------

    /// <summary>میانگین مصرف روزانه = مجموع مصرف / تعداد روزهای پنجره تحلیل</summary>
    public static decimal CalculateAverageDailyConsumption(decimal totalConsumption, int numberOfDays)
    {
        if (numberOfDays <= 0) return 0m;
        return Math.Round(totalConsumption / numberOfDays, 4, MidpointRounding.AwayFromZero);
    }

    // ------------------------------------------------------------------
    // ۳. قواعد استثنا روی پارامتر
    // ------------------------------------------------------------------

    /// <summary>بررسی فعال بودن پارامتر</summary>
    public static EvaluationResult CheckParameterActive(InventoryOrderParameter parameter)
        => parameter.IsActive
            ? EvaluationResult.Proceed()
            : EvaluationResult.Skip(
                ResultCodes.ParameterInactive,
                "پارامتر سفارش‌دهی این کالا غیرفعال است.");

    /// <summary>بررسی بازه اعتبار پارامتر</summary>
    public static EvaluationResult CheckParameterValidity(InventoryOrderParameter parameter, DateTime asOf)
    {
        if (parameter.ValidFrom.Date > asOf.Date)
            return EvaluationResult.Skip(
                ResultCodes.ParameterNotYetValid,
                $"تاریخ اعتبار پارامتر از {parameter.ValidFrom:yyyy-MM-dd} آغاز می‌شود و هنوز معتبر نیست.");

        if (parameter.ValidTo.HasValue && parameter.ValidTo.Value.Date < asOf.Date)
            return EvaluationResult.Skip(
                ResultCodes.ParameterExpired,
                $"اعتبار پارامتر در تاریخ {parameter.ValidTo.Value:yyyy-MM-dd} به پایان رسیده است.");

        return EvaluationResult.Proceed();
    }

    /// <summary>بررسی سازگاری حداقل و حداکثر موجودی</summary>
    public static EvaluationResult CheckMinMaxConfiguration(InventoryOrderParameter parameter)
    {
        if (parameter.MinimumStock.HasValue && parameter.MinimumStock.Value < 0)
            return EvaluationResult.Error(
                ResultCodes.InvalidMinMax,
                "حداقل موجودی نمی‌تواند منفی باشد.");

        if (parameter.MaximumStock.HasValue && parameter.MaximumStock.Value < 0)
            return EvaluationResult.Error(
                ResultCodes.InvalidMinMax,
                "حداکثر موجودی نمی‌تواند منفی باشد.");

        if (parameter.MinimumStock.HasValue && parameter.MaximumStock.HasValue &&
            parameter.MaximumStock.Value < parameter.MinimumStock.Value)
            return EvaluationResult.Error(
                ResultCodes.InvalidMinMax,
                "حداکثر موجودی نمی‌تواند کمتر از حداقل موجودی باشد.");

        return EvaluationResult.Proceed();
    }

    /// <summary>بررسی سازگاری بازه مقدار سفارش</summary>
    public static EvaluationResult CheckOrderQuantityRange(InventoryOrderParameter parameter)
    {
        if (parameter.MinimumOrderQuantity.HasValue && parameter.MinimumOrderQuantity.Value < 0)
            return EvaluationResult.Error(
                ResultCodes.InvalidOrderQuantityRange,
                "مقدار حداقل سفارش نمی‌تواند منفی باشد.");

        if (parameter.MinimumOrderQuantity.HasValue && parameter.MaximumOrderQuantity.HasValue &&
            parameter.MaximumOrderQuantity.Value < parameter.MinimumOrderQuantity.Value)
            return EvaluationResult.Error(
                ResultCodes.InvalidOrderQuantityRange,
                "مقدار حداکثر سفارش نمی‌تواند کمتر از مقدار حداقل سفارش باشد.");

        if (parameter.OrderBatchSize.HasValue && parameter.OrderBatchSize.Value < 0)
            return EvaluationResult.Error(
                ResultCodes.InvalidOrderQuantityRange,
                "اندازه انباشته سفارش نمی‌تواند منفی باشد.");

        return EvaluationResult.Proceed();
    }

    /// <summary>بررسی وجود زمان تقریبی تامین برای روش مبتنی بر مصرف</summary>
    public static EvaluationResult CheckLeadTime(InventoryOrderParameter parameter)
    {
        if (parameter.OrderingMethod != OrderingMethod.ConsumptionBased)
            return EvaluationResult.Proceed();

        if (!parameter.LeadTimeDays.HasValue || parameter.LeadTimeDays.Value <= 0)
            return EvaluationResult.Error(
                ResultCodes.LeadTimeMissing,
                "برای روش «بر اساس مصرف»، زمان تقریبی تامین باید تعیین شده باشد.");

        return EvaluationResult.Proceed();
    }

    /// <summary>بررسی وجود انبار و سایت</summary>
    public static EvaluationResult CheckLocation(InventoryOrderParameter parameter)
    {
        if (parameter.WarehouseId <= 0)
            return EvaluationResult.Error(ResultCodes.WarehouseMissing, "انبار برای این پارامتر تعیین نشده است.");

        if (parameter.SiteId <= 0)
            return EvaluationResult.Error(ResultCodes.SiteMissing, "سایت برای این پارامتر تعیین نشده است.");

        return EvaluationResult.Proceed();
    }

    /// <summary>بررسی موجودی غیرعادی منفی</summary>
    public static EvaluationResult CheckInventorySanity(decimal onHand, decimal reserved, decimal incoming)
    {
        if (onHand < 0 || reserved < 0 || incoming < 0)
            return EvaluationResult.Error(
                ResultCodes.NegativeInventory,
                $"موجودی نامعتبر است (موجودی فعلی: {N(onHand)}، رزرو شده: {N(reserved)}، ورودی قطعی: {N(incoming)}).");

        return EvaluationResult.Proceed();
    }

    /// <summary>بررسی وجود پارامتر سفارش‌دهی برای کلید کسب‌وکار</summary>
    public static EvaluationResult CheckParameterExists(InventoryOrderParameter? parameter)
        => parameter is not null
            ? EvaluationResult.Proceed()
            : EvaluationResult.Error(
                ResultCodes.ParameterMissing,
                "برای این کالا در این انبار و سایت، پارامتر سفارش‌دهی تعریف نشده است.");

    /// <summary>
    /// اجرای تمام قواعد استثنا روی یک بسته ورودی و بازگرداندن اولین نتیجه بازدارنده.
    /// در صورت نبود مشکل، Proceed بازگردانده می‌شود.
    /// </summary>
    public static EvaluationResult ValidateInput(ReplenishmentInput input, DateTime asOf)
    {
        var existence = CheckParameterExists(input.Parameter);
        if (existence.Outcome != EvaluationOutcome.Proceed)
            return existence;

        var parameter = input.Parameter!;

        var checks = new[]
        {
            CheckParameterActive(parameter),
            CheckParameterValidity(parameter, asOf),
            CheckLocation(parameter),
            CheckMinMaxConfiguration(parameter),
            CheckOrderQuantityRange(parameter),
            CheckLeadTime(parameter),
            CheckInventorySanity(input.OnHandQuantity, input.ReservedQuantity, input.ConfirmedIncomingQuantity)
        };

        foreach (var check in checks)
        {
            if (check.Outcome != EvaluationOutcome.Proceed)
                return check;
        }

        return EvaluationResult.Proceed();
    }

    // ------------------------------------------------------------------
    // ۴. قواعد سفارش‌دهی
    // ------------------------------------------------------------------

    /// <summary>قاعده ۱ — نقطه سفارش</summary>
    public static RuleEvaluation ApplyReorderPointRule(
        InventoryOrderParameter parameter, decimal effectiveStock)
    {
        if (!parameter.ReorderPoint.HasValue)
            return new RuleEvaluation(false, 0m, null,
                ResultCodes.ReorderPointMissing,
                "نقطه سفارش برای این کالا تعیین نشده است.",
                EvaluationOutcome.Error);

        var reorderPoint = parameter.ReorderPoint.Value;

        if (effectiveStock > reorderPoint)
            return new RuleEvaluation(false, 0m, reorderPoint,
                ResultCodes.StockSufficient,
                $"موجودی موثر ({N(effectiveStock)}) بالاتر از نقطه سفارش ({N(reorderPoint)}) است.");

        // سطح هدف: سطح مطلوب و در نبود آن حداکثر موجودی
        var target = parameter.DesiredStockLevel ?? parameter.MaximumStock;

        if (!target.HasValue)
            return new RuleEvaluation(false, 0m, null,
                ResultCodes.TargetLevelMissing,
                "برای محاسبه مقدار سفارش، «سطح مطلوب» یا «حداکثر موجودی» باید تعیین شده باشد.",
                EvaluationOutcome.Error);

        var quantity = target.Value - effectiveStock;

        return new RuleEvaluation(true, quantity, target.Value,
            ResultCodes.BelowReorderPoint,
            $"موجودی موثر ({N(effectiveStock)}) به نقطه سفارش ({N(reorderPoint)}) رسیده است؛ " +
            $"جبران تا سطح هدف ({N(target.Value)}).");
    }

    /// <summary>قاعده ۲ — حداقل / حداکثر</summary>
    public static RuleEvaluation ApplyMinMaxRule(
        InventoryOrderParameter parameter, decimal effectiveStock)
    {
        if (!parameter.MinimumStock.HasValue || !parameter.MaximumStock.HasValue)
            return new RuleEvaluation(false, 0m, null,
                ResultCodes.InvalidMinMax,
                "برای روش «حداقل/حداکثر»، هر دو مقدار حداقل و حداکثر موجودی الزامی است.",
                EvaluationOutcome.Error);

        var min = parameter.MinimumStock.Value;
        var max = parameter.MaximumStock.Value;

        if (effectiveStock >= min)
            return new RuleEvaluation(false, 0m, max,
                ResultCodes.StockSufficient,
                $"موجودی موثر ({N(effectiveStock)}) کمتر از حداقل موجودی ({N(min)}) نیست.");

        var quantity = max - effectiveStock;

        return new RuleEvaluation(true, quantity, max,
            ResultCodes.BelowMinimumStock,
            $"موجودی موثر ({N(effectiveStock)}) کمتر از حداقل موجودی ({N(min)}) است؛ " +
            $"جبران تا حداکثر موجودی ({N(max)}).");
    }

    /// <summary>قاعده ۳ — سطح مطلوب</summary>
    public static RuleEvaluation ApplyDesiredLevelRule(
        InventoryOrderParameter parameter, decimal effectiveStock)
    {
        if (!parameter.DesiredStockLevel.HasValue)
            return new RuleEvaluation(false, 0m, null,
                ResultCodes.TargetLevelMissing,
                "برای روش «سطح مطلوب»، مقدار سطح مطلوب الزامی است.",
                EvaluationOutcome.Error);

        var desired = parameter.DesiredStockLevel.Value;

        if (effectiveStock >= desired)
            return new RuleEvaluation(false, 0m, desired,
                ResultCodes.StockSufficient,
                $"موجودی موثر ({N(effectiveStock)}) کمتر از سطح مطلوب ({N(desired)}) نیست.");

        var quantity = desired - effectiveStock;

        return new RuleEvaluation(true, quantity, desired,
            ResultCodes.BelowDesiredLevel,
            $"موجودی موثر ({N(effectiveStock)}) کمتر از سطح مطلوب ({N(desired)}) است.");
    }

    /// <summary>قاعده ۴ — بر اساس مصرف</summary>
    public static RuleEvaluation ApplyConsumptionBasedRule(
        InventoryOrderParameter parameter,
        decimal effectiveStock,
        decimal averageDailyConsumption)
    {
        if (!parameter.LeadTimeDays.HasValue || parameter.LeadTimeDays.Value <= 0)
            return new RuleEvaluation(false, 0m, null,
                ResultCodes.LeadTimeMissing,
                "برای روش «بر اساس مصرف»، زمان تقریبی تامین الزامی است.",
                EvaluationOutcome.Error);

        var leadTime = parameter.LeadTimeDays.Value;
        var safetyStock = parameter.SafetyStock ?? 0m;

        // پیش‌بینی تقاضا در طول دوره تامین
        var forecastDemand = averageDailyConsumption * leadTime;

        // موجودی هدف = تقاضای پیش‌بینی‌شده + مقدار ذخیره
        var targetStock = forecastDemand + safetyStock;

        if (effectiveStock >= targetStock)
            return new RuleEvaluation(false, 0m, targetStock,
                ResultCodes.StockSufficient,
                $"موجودی موثر ({N(effectiveStock)}) پاسخگوی موجودی هدف ({N(targetStock)}) است.");

        var quantity = targetStock - effectiveStock;

        return new RuleEvaluation(true, quantity, targetStock,
            ResultCodes.BelowConsumptionTarget,
            $"میانگین مصرف روزانه {N(averageDailyConsumption)} × زمان تامین {leadTime} روز " +
            $"+ مقدار ذخیره {N(safetyStock)} = موجودی هدف {N(targetStock)}؛ " +
            $"موجودی موثر {N(effectiveStock)} کمتر از آن است.");
    }

    /// <summary>انتخاب و اجرای قاعده متناسب با «نحوه سفارش‌دهی»</summary>
    public static RuleEvaluation ApplyRule(
        InventoryOrderParameter parameter,
        decimal effectiveStock,
        decimal averageDailyConsumption)
        => parameter.OrderingMethod switch
        {
            OrderingMethod.ReorderPoint => ApplyReorderPointRule(parameter, effectiveStock),
            OrderingMethod.MinMax => ApplyMinMaxRule(parameter, effectiveStock),
            OrderingMethod.DesiredLevel => ApplyDesiredLevelRule(parameter, effectiveStock),
            OrderingMethod.ConsumptionBased => ApplyConsumptionBasedRule(parameter, effectiveStock, averageDailyConsumption),
            _ => new RuleEvaluation(false, 0m, null,
                ResultCodes.ParameterMissing,
                "نحوه سفارش‌دهی نامعتبر است.",
                EvaluationOutcome.Error)
        };

    // ------------------------------------------------------------------
    // ۵. نرمال‌سازی مقدار پیشنهادی
    // ------------------------------------------------------------------

    /// <summary>گرد کردن رو به بالا تا نزدیک‌ترین مضرب اندازه انباشته</summary>
    public static decimal RoundUpToBatchSize(decimal quantity, decimal batchSize)
    {
        if (batchSize <= 0) return quantity;
        var batches = Math.Ceiling(quantity / batchSize);
        return batches * batchSize;
    }

    /// <summary>
    /// اعمال مقدار حداقل سفارش، مقدار بهینه سفارش، اندازه انباشته و مقدار حداکثر سفارش.
    /// ترتیب اعمال: حداقل سفارش ← مقدار بهینه ← گرد کردن به انباشته ← کنترل حداکثر.
    /// کنترل حداکثر در انتها انجام می‌شود تا گرد کردن نتواند از سقف عبور کند بدون آنکه دیده شود.
    /// </summary>
    public static NormalizationResult Normalize(InventoryOrderParameter parameter, decimal rawQuantity)
    {
        var steps = new List<string>();

        if (rawQuantity <= 0)
        {
            return new NormalizationResult(0m, EvaluationOutcome.Skip,
                ResultCodes.NonPositiveSuggestion,
                "مقدار پیشنهادی سفارش مثبت نیست؛ نیازی به سفارش وجود ندارد.",
                steps);
        }

        var quantity = rawQuantity;

        // مقدار حداقل سفارش
        if (parameter.MinimumOrderQuantity is { } minOrder && minOrder > 0 && quantity < minOrder)
        {
            steps.Add($"افزایش از {N(quantity)} به مقدار حداقل سفارش {N(minOrder)}");
            quantity = minOrder;
        }

        // مقدار بهینه سفارش — به عنوان کف اقتصادی سفارش اعمال می‌شود
        if (parameter.EconomicOrderQuantity is { } eoq && eoq > 0 && quantity < eoq)
        {
            steps.Add($"افزایش از {N(quantity)} به مقدار بهینه سفارش {N(eoq)}");
            quantity = eoq;
        }

        // اندازه انباشته سفارش — گرد کردن رو به بالا
        if (parameter.OrderBatchSize is { } batch && batch > 0)
        {
            var rounded = RoundUpToBatchSize(quantity, batch);
            if (rounded != quantity)
            {
                steps.Add($"گرد کردن از {N(quantity)} به {N(rounded)} بر اساس اندازه انباشته {N(batch)}");
                quantity = rounded;
            }
        }

        // مقدار حداکثر سفارش — مقدار بریده نمی‌شود، بلکه نیازمند بررسی علامت می‌خورد
        if (parameter.MaximumOrderQuantity is { } maxOrder && maxOrder > 0 && quantity > maxOrder)
        {
            return new NormalizationResult(quantity, EvaluationOutcome.RequireReview,
                ResultCodes.AboveMaximumOrderQuantity,
                $"مقدار پیشنهادی ({N(quantity)}) از مقدار حداکثر سفارش ({N(maxOrder)}) بیشتر است و نیازمند بررسی کاربر است.",
                steps);
        }

        var message = steps.Count == 0
            ? string.Empty
            : string.Join(" ← ", steps);

        return new NormalizationResult(quantity, EvaluationOutcome.Proceed,
            steps.Count == 0 ? string.Empty : ResultCodes.RoundedToBatchSize,
            message,
            steps);
    }

    // ------------------------------------------------------------------
    // ۶. آستانه تغییر مقدار توسط کاربر
    // ------------------------------------------------------------------

    /// <summary>آستانه انحراف مجاز مقدار درخواست از مقدار پیشنهادی (۲۰ درصد)</summary>
    public const decimal QuantityChangeThreshold = 0.20m;

    /// <summary>
    /// آیا انحراف مقدار درخواست از مقدار پیشنهادی به اندازه‌ای است
    /// که ثبت «دلیل تغییر مقدار پیشنهادی» الزامی شود؟
    /// </summary>
    public static bool RequiresChangeReason(decimal suggestedQuantity, decimal requestedQuantity)
    {
        if (suggestedQuantity <= 0)
            return requestedQuantity > 0;

        var deviation = Math.Abs(requestedQuantity - suggestedQuantity) / suggestedQuantity;
        return deviation > QuantityChangeThreshold;
    }
}
