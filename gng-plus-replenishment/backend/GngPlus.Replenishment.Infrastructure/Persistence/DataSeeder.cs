using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace GngPlus.Replenishment.Infrastructure.Persistence;

/// <summary>
/// داده نمونه ماژول سفارش‌دهی کالا.
/// سناریوها عمداً طوری چیده شده‌اند که تمام مسیرهای منطق کسب‌وکار پوشش داده شود:
/// زیر نقطه سفارش، موجودی کافی، درخواست خرید باز، تنظیمات نامعتبر حداقل/حداکثر،
/// پارامتر منقضی، پارامتر غیرفعال، سفارش بر اساس مصرف، گرد کردن به اندازه انباشته،
/// عبور از حداکثر مقدار سفارش، موجودی منفی و نبود پارامتر سفارش‌دهی.
/// </summary>
public static class DataSeeder
{
    /// <summary>تعداد روزهای تاریخچه مصرف تولیدشده</summary>
    private const int ConsumptionHistoryDays = 90;

    public static async Task SeedAsync(ReplenishmentDbContext db, CancellationToken ct = default)
    {
        if (await db.Products.AnyAsync(ct))
            return;

        var today = DateTime.UtcNow.Date;

        // ------------------------------------------------------------------
        // لیست‌های انتخابی
        // ------------------------------------------------------------------
        var sites = new[]
        {
            new Site { Id = 1, Name = "سایت مرکزی تهران" },
            new Site { Id = 2, Name = "سایت تولید کاشان" }
        };

        var warehouses = new[]
        {
            new Warehouse { Id = 1, Name = "انبار مرکزی", SiteId = 1 },
            new Warehouse { Id = 2, Name = "انبار اداری", SiteId = 1 },
            new Warehouse { Id = 3, Name = "انبار قطعات تولید", SiteId = 2 }
        };

        var groups = new[]
        {
            new ProductGroup { Id = 1, Name = "ملزومات اداری" },
            new ProductGroup { Id = 2, Name = "بسته‌بندی" },
            new ProductGroup { Id = 3, Name = "ایمنی و حفاظت" },
            new ProductGroup { Id = 4, Name = "مواد شیمیایی" },
            new ProductGroup { Id = 5, Name = "قطعات یدکی" },
            new ProductGroup { Id = 6, Name = "تجهیزات برقی" }
        };

        var natures = new[]
        {
            new ProductNature { Id = 1, Name = "مصرفی" },
            new ProductNature { Id = 2, Name = "سرمایه‌ای" },
            new ProductNature { Id = 3, Name = "نیم‌ساخته" }
        };

        var units = new[]
        {
            new UnitOfMeasure { Id = 1, Name = "بسته" },
            new UnitOfMeasure { Id = 2, Name = "عدد" },
            new UnitOfMeasure { Id = 3, Name = "کارتن" },
            new UnitOfMeasure { Id = 4, Name = "کیلوگرم" },
            new UnitOfMeasure { Id = 5, Name = "لیتر" },
            new UnitOfMeasure { Id = 6, Name = "متر" },
            new UnitOfMeasure { Id = 7, Name = "رول" },
            new UnitOfMeasure { Id = 8, Name = "جفت" }
        };

        var scopes = new[]
        {
            new ParameterScope { Id = 1, Name = "کالا در انبار" },
            new ParameterScope { Id = 2, Name = "کالا در سایت" },
            new ParameterScope { Id = 3, Name = "کالا (سراسری)" }
        };

        var requestTypes = new[]
        {
            new RequestType { Id = 1, Name = "درخواست خرید داخلی" },
            new RequestType { Id = 2, Name = "درخواست خرید خارجی" },
            new RequestType { Id = 3, Name = "درخواست تامین انبار" }
        };

        var classifications = new[]
        {
            new RequestClassification { Id = 1, Name = "عادی" },
            new RequestClassification { Id = 2, Name = "فوری" },
            new RequestClassification { Id = 3, Name = "برنامه‌ریزی‌شده" }
        };

        var qcParameters = new[]
        {
            new QualityControlParameter { Id = 1, Name = "بدون کنترل کیفیت" },
            new QualityControlParameter { Id = 2, Name = "کنترل نمونه‌ای" },
            new QualityControlParameter { Id = 3, Name = "کنترل کامل" }
        };

        var testPlans = new[]
        {
            new TestPlan { Id = 1, Name = "طرح آزمایش استاندارد" },
            new TestPlan { Id = 2, Name = "طرح آزمایش سریع" }
        };

        db.Sites.AddRange(sites);
        db.Warehouses.AddRange(warehouses);
        db.ProductGroups.AddRange(groups);
        db.ProductNatures.AddRange(natures);
        db.UnitsOfMeasure.AddRange(units);
        db.ParameterScopes.AddRange(scopes);
        db.RequestTypes.AddRange(requestTypes);
        db.RequestClassifications.AddRange(classifications);
        db.QualityControlParameters.AddRange(qcParameters);
        db.TestPlans.AddRange(testPlans);

        // ------------------------------------------------------------------
        // کالاها
        // ------------------------------------------------------------------
        var products = new[]
        {
            new Product { Id = 1,  Code = "KLA-1001", Name = "کاغذ A4",             ProductGroupId = 1, NatureId = 1, UnitOfMeasureId = 1 },
            new Product { Id = 2,  Code = "KLA-1002", Name = "کارتن بسته‌بندی",      ProductGroupId = 2, NatureId = 1, UnitOfMeasureId = 3 },
            new Product { Id = 3,  Code = "KLA-1003", Name = "تونر پرینتر",          ProductGroupId = 1, NatureId = 1, UnitOfMeasureId = 2 },
            new Product { Id = 4,  Code = "KLA-1004", Name = "دستکش ایمنی",          ProductGroupId = 3, NatureId = 1, UnitOfMeasureId = 8 },
            new Product { Id = 5,  Code = "KLA-1005", Name = "روغن صنعتی",           ProductGroupId = 4, NatureId = 1, UnitOfMeasureId = 5 },
            new Product { Id = 6,  Code = "KLA-1006", Name = "پیچ صنعتی",            ProductGroupId = 5, NatureId = 1, UnitOfMeasureId = 2 },
            new Product { Id = 7,  Code = "KLA-1007", Name = "فیوز",                 ProductGroupId = 6, NatureId = 1, UnitOfMeasureId = 2 },
            new Product { Id = 8,  Code = "KLA-1008", Name = "کابل برق",             ProductGroupId = 6, NatureId = 1, UnitOfMeasureId = 6 },
            new Product { Id = 9,  Code = "KLA-1009", Name = "مواد شوینده",          ProductGroupId = 4, NatureId = 1, UnitOfMeasureId = 5 },
            new Product { Id = 10, Code = "KLA-1010", Name = "لیبل چاپ",             ProductGroupId = 2, NatureId = 1, UnitOfMeasureId = 7 },
            new Product { Id = 11, Code = "KLA-1011", Name = "چسب نواری",            ProductGroupId = 2, NatureId = 1, UnitOfMeasureId = 2 },
            new Product { Id = 12, Code = "KLA-1012", Name = "ماسک تنفسی",           ProductGroupId = 3, NatureId = 1, UnitOfMeasureId = 2 },
            new Product { Id = 13, Code = "KLA-1013", Name = "کفش ایمنی",            ProductGroupId = 3, NatureId = 2, UnitOfMeasureId = 8 },
            new Product { Id = 14, Code = "KLA-1014", Name = "گریس صنعتی",           ProductGroupId = 4, NatureId = 1, UnitOfMeasureId = 4 },
            new Product { Id = 15, Code = "KLA-1015", Name = "واشر فلزی",            ProductGroupId = 5, NatureId = 1, UnitOfMeasureId = 2 },
            new Product { Id = 16, Code = "KLA-1016", Name = "لامپ LED",             ProductGroupId = 6, NatureId = 1, UnitOfMeasureId = 2 },
            new Product { Id = 17, Code = "KLA-1017", Name = "باتری صنعتی",          ProductGroupId = 6, NatureId = 2, UnitOfMeasureId = 2 },
            new Product { Id = 18, Code = "KLA-1018", Name = "دستمال کاغذی",         ProductGroupId = 1, NatureId = 1, UnitOfMeasureId = 3 },
            new Product { Id = 19, Code = "KLA-1019", Name = "رنگ صنعتی",            ProductGroupId = 4, NatureId = 1, UnitOfMeasureId = 5 },
            new Product { Id = 20, Code = "KLA-1020", Name = "شیلنگ فشار قوی",       ProductGroupId = 5, NatureId = 1, UnitOfMeasureId = 6 }
        };

        db.Products.AddRange(products);
        await db.SaveChangesAsync(ct);

        // ------------------------------------------------------------------
        // پارامترهای سفارش‌دهی — هر ردیف یک سناریوی مشخص را پوشش می‌دهد
        // ------------------------------------------------------------------
        var parameters = new List<InventoryOrderParameter>
        {
            // ۱ — کاغذ A4 / انبار اداری: زیر نقطه سفارش
            Param(1, 2, 1, OrderingMethod.ReorderPoint, today,
                reorderPoint: 200, minStock: 150, maxStock: 1000, desired: 800,
                minOrderQty: 50, batchSize: 50, leadTime: 10, avgDays: 30, classification: 1),

            // ۲ — کارتن بسته‌بندی / انبار مرکزی: حداقل‌حداکثر + گرد کردن به انباشته
            Param(2, 1, 1, OrderingMethod.MinMax, today,
                minStock: 100, maxStock: 400, minOrderQty: 25, batchSize: 25,
                leadTime: 7, avgDays: 30, classification: 1, unitId: 3),

            // ۳ — تونر پرینتر / انبار اداری: موجودی کافی
            Param(3, 2, 1, OrderingMethod.ReorderPoint, today,
                reorderPoint: 20, minStock: 15, maxStock: 100, desired: 80,
                minOrderQty: 5, leadTime: 12, avgDays: 30, classification: 1, unitId: 2),

            // ۴ — دستکش ایمنی / انبار قطعات تولید: سفارش بر اساس مصرف
            Param(4, 3, 2, OrderingMethod.ConsumptionBased, today,
                safetyStock: 100, minOrderQty: 50, batchSize: 50,
                leadTime: 14, avgDays: 30, classification: 3, unitId: 8),

            // ۵ — روغن صنعتی / انبار مرکزی: درخواست خرید باز موجود است
            Param(5, 1, 1, OrderingMethod.ReorderPoint, today,
                reorderPoint: 300, minStock: 200, maxStock: 1000, desired: 900,
                minOrderQty: 50, leadTime: 20, avgDays: 30, classification: 1, unitId: 5),

            // ۶ — پیچ صنعتی / انبار قطعات تولید: تنظیمات نامعتبر حداقل/حداکثر
            Param(6, 3, 2, OrderingMethod.MinMax, today,
                minStock: 500, maxStock: 200, minOrderQty: 100,
                leadTime: 15, avgDays: 30, classification: 1, unitId: 2),

            // ۷ — فیوز / انبار مرکزی: پارامتر منقضی
            Param(7, 1, 1, OrderingMethod.ReorderPoint, today.AddDays(-400),
                reorderPoint: 100, minStock: 80, maxStock: 500, desired: 400,
                minOrderQty: 20, leadTime: 10, avgDays: 30, classification: 1, unitId: 2,
                validTo: today.AddDays(-30)),

            // ۸ — کابل برق / انبار مرکزی: سطح مطلوب
            Param(8, 1, 1, OrderingMethod.DesiredLevel, today,
                minStock: 400, maxStock: 1500, desired: 1200,
                minOrderQty: 100, batchSize: 50, leadTime: 18, avgDays: 30,
                classification: 3, unitId: 6),

            // ۹ — مواد شوینده / انبار مرکزی: عبور از حداکثر مقدار سفارش
            Param(9, 1, 1, OrderingMethod.ReorderPoint, today,
                reorderPoint: 200, minStock: 150, maxStock: 1600, desired: 1500,
                minOrderQty: 50, maxOrderQty: 500, leadTime: 25, avgDays: 30,
                classification: 1, unitId: 5),

            // ۱۰ — لیبل چاپ / انبار مرکزی: گرد کردن ۲۳ به ۳۰
            Param(10, 1, 1, OrderingMethod.MinMax, today,
                minStock: 30, maxStock: 50, batchSize: 10,
                leadTime: 8, avgDays: 30, classification: 1, unitId: 7),

            // ۱۱ — چسب نواری / انبار اداری: پارامتر غیرفعال
            Param(11, 2, 1, OrderingMethod.ReorderPoint, today,
                reorderPoint: 50, minStock: 40, maxStock: 200, desired: 150,
                minOrderQty: 20, leadTime: 6, avgDays: 30, classification: 1, unitId: 2,
                isActive: false),

            // ۱۲ — ماسک تنفسی / انبار قطعات تولید: نبود زمان تامین در روش مبتنی بر مصرف
            Param(12, 3, 2, OrderingMethod.ConsumptionBased, today,
                safetyStock: 200, minOrderQty: 100, avgDays: 30,
                classification: 2, unitId: 2, leadTime: null),

            // ۱۳ — کفش ایمنی / انبار قطعات تولید: موجودی کافی
            Param(13, 3, 2, OrderingMethod.ReorderPoint, today,
                reorderPoint: 40, minStock: 30, maxStock: 200, desired: 150,
                minOrderQty: 10, leadTime: 30, avgDays: 60, classification: 1, unitId: 8),

            // ۱۴ — گریس صنعتی / انبار قطعات تولید: سفارش بر اساس مصرف با پنجره ۶۰ روزه
            Param(14, 3, 2, OrderingMethod.ConsumptionBased, today,
                safetyStock: 50, minOrderQty: 25, batchSize: 25,
                leadTime: 21, avgDays: 60, classification: 3, unitId: 4),

            // ۱۵ — واشر فلزی / انبار قطعات تولید: افزایش به مقدار حداقل سفارش
            Param(15, 3, 2, OrderingMethod.MinMax, today,
                minStock: 1000, maxStock: 1050, minOrderQty: 500,
                leadTime: 12, avgDays: 30, classification: 1, unitId: 2),

            // ۱۶ — لامپ LED / انبار مرکزی: موجودی کافی در روش سطح مطلوب
            Param(16, 1, 1, OrderingMethod.DesiredLevel, today,
                minStock: 100, maxStock: 400, desired: 300,
                minOrderQty: 50, leadTime: 14, avgDays: 30, classification: 1, unitId: 2),

            // ۱۷ — باتری صنعتی / انبار مرکزی: موجودی منفی غیرعادی
            Param(17, 1, 1, OrderingMethod.ReorderPoint, today,
                reorderPoint: 30, minStock: 20, maxStock: 150, desired: 120,
                minOrderQty: 10, leadTime: 40, avgDays: 30, classification: 2, unitId: 2),

            // ۱۸ — دستمال کاغذی / انبار اداری: حداقل‌حداکثر
            Param(18, 2, 1, OrderingMethod.MinMax, today,
                minStock: 40, maxStock: 200, minOrderQty: 10,
                leadTime: 5, avgDays: 30, classification: 1, unitId: 3),

            // ۱۹ — رنگ صنعتی / انبار قطعات تولید: نبود تاریخچه مصرف (فقط مقدار ذخیره)
            Param(19, 3, 2, OrderingMethod.ConsumptionBased, today,
                safetyStock: 80, minOrderQty: 20,
                leadTime: 30, avgDays: 45, classification: 1, unitId: 5),

            // ۲۰ — شیلنگ فشار قوی / انبار قطعات تولید: اعمال مقدار بهینه سفارش
            Param(20, 3, 2, OrderingMethod.ReorderPoint, today,
                reorderPoint: 100, minStock: 80, maxStock: 400, desired: 140,
                minOrderQty: 20, economicOrderQty: 200, leadTime: 45, avgDays: 30,
                classification: 3, unitId: 6),

            // ۲۱ — کاغذ A4 / انبار مرکزی: همان کالا در انبار دوم با موجودی کافی
            Param(1, 1, 1, OrderingMethod.ReorderPoint, today,
                reorderPoint: 500, minStock: 400, maxStock: 2500, desired: 2000,
                minOrderQty: 100, batchSize: 100, leadTime: 10, avgDays: 30,
                classification: 1, unitId: 1)
        };

        db.InventoryOrderParameters.AddRange(parameters);

        // ------------------------------------------------------------------
        // تصویر موجودی
        // ------------------------------------------------------------------
        var snapshots = new List<InventorySnapshot>
        {
            Snap(1,  2, 1, onHand: 180,  reserved: 30, incoming: 0,   today), // موثر ۱۵۰ ← زیر نقطه سفارش ۲۰۰
            Snap(2,  1, 1, onHand: 60,   reserved: 10, incoming: 20,  today), // موثر ۷۰  ← زیر حداقل ۱۰۰
            Snap(3,  2, 1, onHand: 95,   reserved: 5,  incoming: 0,   today), // موثر ۹۰  ← کافی
            Snap(4,  3, 2, onHand: 150,  reserved: 20, incoming: 0,   today), // موثر ۱۳۰ ← زیر هدف مصرف
            Snap(5,  1, 1, onHand: 250,  reserved: 0,  incoming: 0,   today), // درخواست باز دارد
            Snap(6,  3, 2, onHand: 300,  reserved: 0,  incoming: 0,   today), // تنظیمات نامعتبر
            Snap(7,  1, 1, onHand: 40,   reserved: 0,  incoming: 0,   today), // پارامتر منقضی
            Snap(8,  1, 1, onHand: 700,  reserved: 50, incoming: 100, today), // موثر ۷۵۰ ← زیر سطح مطلوب ۱۲۰۰
            Snap(9,  1, 1, onHand: 120,  reserved: 20, incoming: 0,   today), // موثر ۱۰۰ ← عبور از حداکثر سفارش
            Snap(10, 1, 1, onHand: 30,   reserved: 3,  incoming: 0,   today), // موثر ۲۷  ← خام ۲۳ ← گرد شده ۳۰
            Snap(10, 2, 1, onHand: 12,   reserved: 0,  incoming: 0,   today), // بدون پارامتر سفارش‌دهی
            Snap(11, 2, 1, onHand: 5,    reserved: 0,  incoming: 0,   today), // پارامتر غیرفعال
            Snap(12, 3, 2, onHand: 300,  reserved: 0,  incoming: 0,   today), // نبود زمان تامین
            Snap(13, 3, 2, onHand: 180,  reserved: 10, incoming: 0,   today), // موثر ۱۷۰ ← کافی
            Snap(14, 3, 2, onHand: 60,   reserved: 5,  incoming: 0,   today), // موثر ۵۵  ← زیر هدف مصرف ۱۵۵
            Snap(15, 3, 2, onHand: 990,  reserved: 0,  incoming: 0,   today), // خام ۶۰ ← حداقل سفارش ۵۰۰
            Snap(16, 1, 1, onHand: 340,  reserved: 0,  incoming: 0,   today), // موثر ۳۴۰ ← کافی
            Snap(17, 1, 1, onHand: -15,  reserved: 0,  incoming: 0,   today), // موجودی منفی غیرعادی
            Snap(18, 2, 1, onHand: 25,   reserved: 5,  incoming: 0,   today), // موثر ۲۰  ← زیر حداقل ۴۰
            Snap(19, 3, 2, onHand: 50,   reserved: 0,  incoming: 0,   today), // بدون تاریخچه مصرف
            Snap(20, 3, 2, onHand: 90,   reserved: 0,  incoming: 0,   today), // موثر ۹۰  ← اعمال مقدار بهینه ۲۰۰
            Snap(1,  1, 1, onHand: 1400, reserved: 100, incoming: 0,  today)  // موثر ۱۳۰۰ ← کافی
        };

        db.InventorySnapshots.AddRange(snapshots);

        // ------------------------------------------------------------------
        // تاریخچه مصرف — نرخ روزانه ثابت تا نتایج محاسبه قابل راستی‌آزمایی باشد
        // «رنگ صنعتی» عمداً بدون تاریخچه مصرف رها شده است.
        // ------------------------------------------------------------------
        var dailyRates = new Dictionary<(int ProductId, int WarehouseId), decimal>
        {
            [(1, 2)] = 12m, [(1, 1)] = 25m,
            [(2, 1)] = 8m,
            [(3, 2)] = 1m,
            [(4, 3)] = 20m,
            [(5, 1)] = 6m,
            [(6, 3)] = 40m,
            [(7, 1)] = 2m,
            [(8, 1)] = 15m,
            [(9, 1)] = 9m,
            [(10, 1)] = 3m,
            [(11, 2)] = 2m,
            [(12, 3)] = 10m,
            [(13, 3)] = 1m,
            [(14, 3)] = 5m,
            [(15, 3)] = 30m,
            [(16, 1)] = 4m,
            [(17, 1)] = 1m,
            [(18, 2)] = 7m,
            [(20, 3)] = 2m
        };

        var consumption = new List<ConsumptionHistory>();
        foreach (var ((productId, warehouseId), rate) in dailyRates)
        {
            for (var offset = ConsumptionHistoryDays - 1; offset >= 0; offset--)
            {
                consumption.Add(new ConsumptionHistory
                {
                    ProductId = productId,
                    WarehouseId = warehouseId,
                    Date = today.AddDays(-offset),
                    Quantity = rate
                });
            }
        }

        db.ConsumptionHistories.AddRange(consumption);

        // ------------------------------------------------------------------
        // درخواست خرید باز — سناریوی جلوگیری از خرید تکراری برای «روغن صنعتی»
        // ------------------------------------------------------------------
        var persianYear = new System.Globalization.PersianCalendar().GetYear(today);

        var openRequest = new PurchaseRequest
        {
            RequestNumber = $"PR-{persianYear}-000001",
            Status = PurchaseRequestStatus.Submitted,
            CreatedAt = today.AddDays(-5),
            SubmittedAt = today.AddDays(-5),
            CreatedBy = "کارشناس تدارکات",
            Source = PurchaseRequestSource.Manual,
            WorkflowStatus = WorkflowStatus.Started,
            WorkflowInstanceId = $"WF-PR-{persianYear}-000001",
            RequestTypeId = 1,
            Items =
            {
                new PurchaseRequestItem
                {
                    ProductId = 5,
                    WarehouseId = 1,
                    SiteId = 1,
                    RequestedQuantity = 700,
                    SuggestedQuantity = 700,
                    UnitOfMeasureId = 5,
                    RequestClassificationId = 1
                }
            }
        };

        db.PurchaseRequests.Add(openRequest);

        // ------------------------------------------------------------------
        // تنظیمات اتوماسیون
        // ------------------------------------------------------------------
        db.AutomationSettings.Add(new AutomationSettings
        {
            IsEnabled = true,
            TriggerType = AutomationTriggerType.Manual,
            DailyRunHour = 2
        });

        await db.SaveChangesAsync(ct);
    }

    // ------------------------------------------------------------------

    private static InventoryOrderParameter Param(
        int productId, int warehouseId, int siteId, OrderingMethod method, DateTime validFrom,
        decimal? reorderPoint = null, decimal? minStock = null, decimal? maxStock = null,
        decimal? desired = null, decimal? safetyStock = null,
        decimal? minOrderQty = null, decimal? maxOrderQty = null,
        decimal? batchSize = null, decimal? economicOrderQty = null,
        int? leadTime = null, int? avgDays = null,
        int? classification = null, int unitId = 1,
        DateTime? validTo = null, bool isActive = true)
        => new()
        {
            ProductId = productId,
            WarehouseId = warehouseId,
            SiteId = siteId,
            ParameterScopeId = 1,
            UnitOfMeasureId = unitId,
            RequestTypeId = 1,
            OrderingMethod = method,
            DefaultRequestClassificationId = classification,
            QualityControlParameterId = 1,
            TestPlanId = 1,
            ReorderPoint = reorderPoint,
            MinimumStock = minStock,
            MaximumStock = maxStock,
            DesiredStockLevel = desired,
            SafetyStock = safetyStock,
            SpecialValueCoefficient = 1m,
            AverageConsumptionDays = avgDays,
            MinimumCoverageDays = 15,
            SalesCoverageDays = 30,
            MinimumOrderQuantity = minOrderQty,
            MaximumOrderQuantity = maxOrderQty,
            OrderBatchSize = batchSize,
            EconomicOrderQuantity = economicOrderQty,
            LeadTimeDays = leadTime,
            ValidFrom = validFrom,
            ValidTo = validTo,
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow
        };

    private static InventorySnapshot Snap(
        int productId, int warehouseId, int siteId,
        decimal onHand, decimal reserved, decimal incoming, DateTime date)
        => new()
        {
            ProductId = productId,
            WarehouseId = warehouseId,
            SiteId = siteId,
            OnHandQuantity = onHand,
            ReservedQuantity = reserved,
            ConfirmedIncomingQuantity = incoming,
            SnapshotDate = date
        };
}
