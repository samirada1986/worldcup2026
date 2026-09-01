using GngPlus.Replenishment.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace GngPlus.Replenishment.Infrastructure.Persistence;

/// <summary>بستر داده ماژول سفارش‌دهی کالا</summary>
public class ReplenishmentDbContext : DbContext
{
    public ReplenishmentDbContext(DbContextOptions<ReplenishmentDbContext> options) : base(options) { }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductGroup> ProductGroups => Set<ProductGroup>();
    public DbSet<ProductNature> ProductNatures => Set<ProductNature>();
    public DbSet<UnitOfMeasure> UnitsOfMeasure => Set<UnitOfMeasure>();
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Site> Sites => Set<Site>();
    public DbSet<ParameterScope> ParameterScopes => Set<ParameterScope>();
    public DbSet<RequestType> RequestTypes => Set<RequestType>();
    public DbSet<RequestClassification> RequestClassifications => Set<RequestClassification>();
    public DbSet<QualityControlParameter> QualityControlParameters => Set<QualityControlParameter>();
    public DbSet<TestPlan> TestPlans => Set<TestPlan>();

    public DbSet<InventoryOrderParameter> InventoryOrderParameters => Set<InventoryOrderParameter>();
    public DbSet<InventorySnapshot> InventorySnapshots => Set<InventorySnapshot>();
    public DbSet<ConsumptionHistory> ConsumptionHistories => Set<ConsumptionHistory>();

    public DbSet<PurchaseRequest> PurchaseRequests => Set<PurchaseRequest>();
    public DbSet<PurchaseRequestItem> PurchaseRequestItems => Set<PurchaseRequestItem>();
    public DbSet<WorkflowInstance> WorkflowInstances => Set<WorkflowInstance>();

    public DbSet<AutomationRun> AutomationRuns => Set<AutomationRun>();
    public DbSet<ReplenishmentRecommendation> ReplenishmentRecommendations => Set<ReplenishmentRecommendation>();
    public DbSet<AutomationAuditLog> AutomationAuditLogs => Set<AutomationAuditLog>();
    public DbSet<AutomationSettings> AutomationSettings => Set<AutomationSettings>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // --- لیست‌های انتخابی ---
        b.Entity<Product>(e =>
        {
            e.HasIndex(x => x.Code).IsUnique();
            e.Property(x => x.Code).HasMaxLength(40).IsRequired();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.ProductGroup).WithMany().HasForeignKey(x => x.ProductGroupId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Nature).WithMany().HasForeignKey(x => x.NatureId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.UnitOfMeasure).WithMany().HasForeignKey(x => x.UnitOfMeasureId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<Warehouse>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Site).WithMany().HasForeignKey(x => x.SiteId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<ProductGroup>(e => e.Property(x => x.Name).HasMaxLength(200).IsRequired());
        b.Entity<ProductNature>(e => e.Property(x => x.Name).HasMaxLength(200).IsRequired());
        b.Entity<UnitOfMeasure>(e => e.Property(x => x.Name).HasMaxLength(100).IsRequired());
        b.Entity<Site>(e => e.Property(x => x.Name).HasMaxLength(200).IsRequired());
        b.Entity<ParameterScope>(e => e.Property(x => x.Name).HasMaxLength(200).IsRequired());
        b.Entity<RequestType>(e => e.Property(x => x.Name).HasMaxLength(200).IsRequired());
        b.Entity<RequestClassification>(e => e.Property(x => x.Name).HasMaxLength(200).IsRequired());
        b.Entity<QualityControlParameter>(e => e.Property(x => x.Name).HasMaxLength(200).IsRequired());
        b.Entity<TestPlan>(e => e.Property(x => x.Name).HasMaxLength(200).IsRequired());

        // --- پارامتر سفارش‌دهی ---
        b.Entity<InventoryOrderParameter>(e =>
        {
            // کلید کسب‌وکار: کالا + انبار + سایت
            e.HasIndex(x => new { x.ProductId, x.WarehouseId, x.SiteId }).IsUnique();

            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Site).WithMany().HasForeignKey(x => x.SiteId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.ParameterScope).WithMany().HasForeignKey(x => x.ParameterScopeId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.UnitOfMeasure).WithMany().HasForeignKey(x => x.UnitOfMeasureId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.RequestType).WithMany().HasForeignKey(x => x.RequestTypeId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.DefaultRequestClassification).WithMany().HasForeignKey(x => x.DefaultRequestClassificationId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.QualityControlParameter).WithMany().HasForeignKey(x => x.QualityControlParameterId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.TestPlan).WithMany().HasForeignKey(x => x.TestPlanId).OnDelete(DeleteBehavior.Restrict);

            foreach (var prop in new[]
                     {
                         nameof(InventoryOrderParameter.ReorderPoint),
                         nameof(InventoryOrderParameter.MinimumStock),
                         nameof(InventoryOrderParameter.MaximumStock),
                         nameof(InventoryOrderParameter.DesiredStockLevel),
                         nameof(InventoryOrderParameter.SafetyStock),
                         nameof(InventoryOrderParameter.SpecialValueCoefficient),
                         nameof(InventoryOrderParameter.MinimumOrderQuantity),
                         nameof(InventoryOrderParameter.MaximumOrderQuantity),
                         nameof(InventoryOrderParameter.OrderBatchSize),
                         nameof(InventoryOrderParameter.EconomicOrderQuantity)
                     })
            {
                e.Property<decimal?>(prop).HasPrecision(18, 4);
            }
        });

        // --- موجودی و مصرف ---
        b.Entity<InventorySnapshot>(e =>
        {
            e.HasIndex(x => new { x.ProductId, x.WarehouseId, x.SiteId, x.SnapshotDate });
            e.Property(x => x.OnHandQuantity).HasPrecision(18, 4);
            e.Property(x => x.ReservedQuantity).HasPrecision(18, 4);
            e.Property(x => x.ConfirmedIncomingQuantity).HasPrecision(18, 4);
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Site).WithMany().HasForeignKey(x => x.SiteId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<ConsumptionHistory>(e =>
        {
            e.HasIndex(x => new { x.ProductId, x.WarehouseId, x.Date });
            e.Property(x => x.Quantity).HasPrecision(18, 4);
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
        });

        // --- درخواست خرید ---
        b.Entity<PurchaseRequest>(e =>
        {
            e.HasIndex(x => x.RequestNumber).IsUnique();
            e.Property(x => x.RequestNumber).HasMaxLength(40).IsRequired();
            e.Property(x => x.CreatedBy).HasMaxLength(120);
            e.Property(x => x.IdempotencyKey).HasMaxLength(120);
            e.Property(x => x.WorkflowInstanceId).HasMaxLength(60);

            // یکتاسازی عملیات ایجاد پیش‌نویس در سطح پایگاه داده
            e.HasIndex(x => x.IdempotencyKey).IsUnique().HasFilter(null);

            e.HasMany(x => x.Items).WithOne(x => x.PurchaseRequest)
                .HasForeignKey(x => x.PurchaseRequestId).OnDelete(DeleteBehavior.Cascade);

            e.HasOne(x => x.AutomationRun).WithMany()
                .HasForeignKey(x => x.AutomationRunId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<PurchaseRequestItem>(e =>
        {
            e.HasIndex(x => new { x.ProductId, x.WarehouseId, x.SiteId });
            e.Property(x => x.RequestedQuantity).HasPrecision(18, 4);
            e.Property(x => x.SuggestedQuantity).HasPrecision(18, 4);
            e.Property(x => x.QuantityChangeReason).HasMaxLength(1000);
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Site).WithMany().HasForeignKey(x => x.SiteId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.UnitOfMeasure).WithMany().HasForeignKey(x => x.UnitOfMeasureId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<WorkflowInstance>(e =>
        {
            e.HasIndex(x => x.InstanceKey).IsUnique();
            e.Property(x => x.InstanceKey).HasMaxLength(60).IsRequired();
            e.Property(x => x.CurrentStep).HasMaxLength(200);
            e.HasOne(x => x.PurchaseRequest).WithMany()
                .HasForeignKey(x => x.PurchaseRequestId).OnDelete(DeleteBehavior.Cascade);
        });

        // --- اتوماسیون ---
        b.Entity<AutomationRun>(e =>
        {
            e.Property(x => x.TriggeredBy).HasMaxLength(120);
            e.HasMany(x => x.Recommendations).WithOne(x => x.AutomationRun)
                .HasForeignKey(x => x.AutomationRunId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(x => x.AuditLogs).WithOne(x => x.AutomationRun)
                .HasForeignKey(x => x.AutomationRunId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<ReplenishmentRecommendation>(e =>
        {
            e.HasIndex(x => new { x.AutomationRunId, x.ProductId, x.WarehouseId, x.SiteId });
            e.Property(x => x.Reason).HasMaxLength(1000);
            e.Property(x => x.ReasonCode).HasMaxLength(80);

            foreach (var prop in new[]
                     {
                         nameof(ReplenishmentRecommendation.OnHandQuantity),
                         nameof(ReplenishmentRecommendation.ReservedQuantity),
                         nameof(ReplenishmentRecommendation.ConfirmedIncomingQuantity),
                         nameof(ReplenishmentRecommendation.ExistingOpenRequestQuantity),
                         nameof(ReplenishmentRecommendation.EffectiveStock),
                         nameof(ReplenishmentRecommendation.AverageDailyConsumption),
                         nameof(ReplenishmentRecommendation.RawSuggestedQuantity),
                         nameof(ReplenishmentRecommendation.SuggestedQuantity)
                     })
            {
                e.Property<decimal>(prop).HasPrecision(18, 4);
            }

            e.Property(x => x.ReorderPoint).HasPrecision(18, 4);
            e.Property(x => x.MinimumStock).HasPrecision(18, 4);
            e.Property(x => x.MaximumStock).HasPrecision(18, 4);

            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Warehouse).WithMany().HasForeignKey(x => x.WarehouseId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Site).WithMany().HasForeignKey(x => x.SiteId).OnDelete(DeleteBehavior.Restrict);
        });

        b.Entity<AutomationAuditLog>(e =>
        {
            e.HasIndex(x => x.AutomationRunId);
            e.Property(x => x.Message).HasMaxLength(2000).IsRequired();
            e.Property(x => x.BeforeValue).HasMaxLength(200);
            e.Property(x => x.AfterValue).HasMaxLength(200);
            e.HasOne(x => x.Product).WithMany().HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        base.OnModelCreating(b);
    }
}
