using GngPlus.Replenishment.Application.Abstractions;
using GngPlus.Replenishment.Application.Services;
using GngPlus.Replenishment.Domain.Entities;
using GngPlus.Replenishment.Domain.Enums;
using GngPlus.Replenishment.Infrastructure.Persistence;
using GngPlus.Replenishment.Infrastructure.Repositories;
using GngPlus.Replenishment.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace GngPlus.Replenishment.Tests;

/// <summary>
/// بستر آزمون: پایگاه داده درون‌حافظه به همراه سرویس‌های واقعی.
/// آزمون‌ها روی همان پیاده‌سازی‌هایی اجرا می‌شوند که API استفاده می‌کند.
/// </summary>
public sealed class TestContext : IDisposable
{
    public ReplenishmentDbContext Db { get; }
    public IReplenishmentService Replenishment { get; }
    public IPurchaseRequestService PurchaseRequests { get; }
    public IAutomationService Automation { get; }
    public IInventoryOrderParameterService Parameters { get; }

    public DateTime Today { get; } = DateTime.UtcNow.Date;

    public TestContext()
    {
        var options = new DbContextOptionsBuilder<ReplenishmentDbContext>()
            .UseInMemoryDatabase($"test-{Guid.NewGuid()}")
            .Options;

        Db = new ReplenishmentDbContext(options);

        var data = new ReplenishmentDataRepository(Db);
        var automationRepo = new AutomationRepository(Db);
        var requestRepo = new PurchaseRequestRepository(Db);
        var lookupRepo = new LookupRepository(Db);
        var parameterRepo = new InventoryOrderParameterRepository(Db);
        var workflow = new SimulatedWorkflowService(Db);

        Replenishment = new ReplenishmentService(data, automationRepo);
        PurchaseRequests = new PurchaseRequestService(requestRepo, automationRepo, lookupRepo, workflow);
        Automation = new AutomationService(automationRepo, Replenishment, lookupRepo);
        Parameters = new InventoryOrderParameterService(parameterRepo, lookupRepo);

        SeedBaseData();
    }

    /// <summary>لیست‌های انتخابی پایه که همه آزمون‌ها به آن نیاز دارند</summary>
    private void SeedBaseData()
    {
        Db.Sites.Add(new Site { Id = 1, Name = "سایت آزمون" });
        Db.ProductGroups.Add(new ProductGroup { Id = 1, Name = "گروه آزمون" });
        Db.ProductNatures.Add(new ProductNature { Id = 1, Name = "مصرفی" });
        Db.UnitsOfMeasure.Add(new UnitOfMeasure { Id = 1, Name = "عدد" });
        Db.Warehouses.Add(new Warehouse { Id = 1, Name = "انبار آزمون", SiteId = 1 });
        Db.ParameterScopes.Add(new ParameterScope { Id = 1, Name = "کالا در انبار" });
        Db.RequestTypes.Add(new RequestType { Id = 1, Name = "درخواست خرید داخلی" });
        Db.RequestClassifications.Add(new RequestClassification { Id = 1, Name = "عادی" });
        Db.QualityControlParameters.Add(new QualityControlParameter { Id = 1, Name = "بدون کنترل" });
        Db.TestPlans.Add(new TestPlan { Id = 1, Name = "طرح استاندارد" });
        Db.AutomationSettings.Add(new AutomationSettings { IsEnabled = true });
        Db.SaveChanges();
    }

    /// <summary>افزودن یک کالا</summary>
    public Product AddProduct(int id, string code, string name)
    {
        var product = new Product
        {
            Id = id, Code = code, Name = name,
            ProductGroupId = 1, NatureId = 1, UnitOfMeasureId = 1
        };
        Db.Products.Add(product);
        Db.SaveChanges();
        return product;
    }

    /// <summary>افزودن پارامتر سفارش‌دهی</summary>
    public InventoryOrderParameter AddParameter(
        int productId, OrderingMethod method,
        decimal? reorderPoint = null, decimal? minStock = null, decimal? maxStock = null,
        decimal? desired = null, decimal? safetyStock = null,
        decimal? minOrderQty = null, decimal? maxOrderQty = null,
        decimal? batchSize = null, decimal? economicOrderQty = null,
        int? leadTime = null, int? avgDays = 30,
        bool isActive = true, DateTime? validFrom = null, DateTime? validTo = null)
    {
        var parameter = new InventoryOrderParameter
        {
            ProductId = productId,
            WarehouseId = 1,
            SiteId = 1,
            ParameterScopeId = 1,
            UnitOfMeasureId = 1,
            RequestTypeId = 1,
            OrderingMethod = method,
            DefaultRequestClassificationId = 1,
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
            AverageConsumptionDays = avgDays,
            ValidFrom = validFrom ?? Today,
            ValidTo = validTo,
            IsActive = isActive
        };

        Db.InventoryOrderParameters.Add(parameter);
        Db.SaveChanges();
        return parameter;
    }

    /// <summary>افزودن تصویر موجودی</summary>
    public void AddSnapshot(int productId, decimal onHand, decimal reserved = 0, decimal incoming = 0)
    {
        Db.InventorySnapshots.Add(new InventorySnapshot
        {
            ProductId = productId, WarehouseId = 1, SiteId = 1,
            OnHandQuantity = onHand,
            ReservedQuantity = reserved,
            ConfirmedIncomingQuantity = incoming,
            SnapshotDate = Today
        });
        Db.SaveChanges();
    }

    /// <summary>افزودن مصرف روزانه ثابت برای تعداد روز مشخص</summary>
    public void AddDailyConsumption(int productId, decimal dailyQuantity, int days)
    {
        for (var offset = days - 1; offset >= 0; offset--)
        {
            Db.ConsumptionHistories.Add(new ConsumptionHistory
            {
                ProductId = productId, WarehouseId = 1,
                Date = Today.AddDays(-offset),
                Quantity = dailyQuantity
            });
        }
        Db.SaveChanges();
    }

    /// <summary>افزودن درخواست خرید باز برای کالا</summary>
    public PurchaseRequest AddOpenPurchaseRequest(
        int productId, decimal quantity, PurchaseRequestStatus status = PurchaseRequestStatus.Submitted)
    {
        var request = new PurchaseRequest
        {
            RequestNumber = $"PR-TEST-{Guid.NewGuid().ToString()[..8]}",
            Status = status,
            CreatedBy = "آزمون",
            Source = PurchaseRequestSource.Manual,
            Items =
            {
                new PurchaseRequestItem
                {
                    ProductId = productId, WarehouseId = 1, SiteId = 1,
                    RequestedQuantity = quantity, SuggestedQuantity = quantity,
                    UnitOfMeasureId = 1
                }
            }
        };
        Db.PurchaseRequests.Add(request);
        Db.SaveChanges();
        return request;
    }

    public void Dispose() => Db.Dispose();
}
