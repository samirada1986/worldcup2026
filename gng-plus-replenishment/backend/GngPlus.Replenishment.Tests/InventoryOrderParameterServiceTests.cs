using GngPlus.Replenishment.Application.Common;
using GngPlus.Replenishment.Application.Dtos;
using GngPlus.Replenishment.Domain.Enums;
using Xunit;

namespace GngPlus.Replenishment.Tests;

/// <summary>آزمون اعتبارسنجی پارامترهای سفارش‌دهی کالا</summary>
public class InventoryOrderParameterServiceTests
{
    private static InventoryOrderParameterUpsertDto Valid() => new()
    {
        ProductId = 1,
        WarehouseId = 1,
        SiteId = 1,
        ParameterScopeId = 1,
        UnitOfMeasureId = 1,
        RequestTypeId = 1,
        OrderingMethod = OrderingMethod.ReorderPoint,
        DefaultRequestClassificationId = 1,
        ReorderPoint = 200,
        MinimumStock = 150,
        MaximumStock = 1000,
        DesiredStockLevel = 800,
        MinimumOrderQuantity = 50,
        LeadTimeDays = 10,
        AverageConsumptionDays = 30,
        ValidFrom = DateTime.UtcNow.Date,
        IsActive = true
    };

    [Fact]
    public async Task Create_StoresParameter_WhenInputIsValid()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1001", "کاغذ A4");

        var created = await ctx.Parameters.CreateAsync(Valid());

        Assert.True(created.Id > 0);
        Assert.Equal("کاغذ A4", created.ProductName);
        Assert.Equal("نقطه سفارش", created.OrderingMethodName);
        Assert.True(created.IsActive);
    }

    [Fact]
    public async Task Create_RejectsMaximumStockBelowMinimumStock()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1001", "کاغذ A4");

        var dto = Valid();
        dto.MinimumStock = 500;
        dto.MaximumStock = 200;

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.Parameters.CreateAsync(dto));

        Assert.Equal(ResultCodes.InvalidReplenishmentParameter, error.Code);
        Assert.Contains("حداکثر موجودی نمی‌تواند کمتر از حداقل موجودی باشد.", error.Message);
    }

    [Fact]
    public async Task Create_RejectsNegativeReorderPoint()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1001", "کاغذ A4");

        var dto = Valid();
        dto.ReorderPoint = -1;

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.Parameters.CreateAsync(dto));

        Assert.Contains(nameof(dto.ReorderPoint), error.Details.Keys);
    }

    [Fact]
    public async Task Create_RejectsMaximumOrderQuantityBelowMinimumOrderQuantity()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1001", "کاغذ A4");

        var dto = Valid();
        dto.MinimumOrderQuantity = 100;
        dto.MaximumOrderQuantity = 50;

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.Parameters.CreateAsync(dto));

        Assert.Contains(nameof(dto.MaximumOrderQuantity), error.Details.Keys);
    }

    [Fact]
    public async Task Create_RequiresLeadTime_ForConsumptionBasedMethod()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1001", "کاغذ A4");

        var dto = Valid();
        dto.OrderingMethod = OrderingMethod.ConsumptionBased;
        dto.LeadTimeDays = null;

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.Parameters.CreateAsync(dto));

        Assert.Contains(nameof(dto.LeadTimeDays), error.Details.Keys);
    }

    [Fact]
    public async Task Create_RejectsValidToBeforeValidFrom()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1001", "کاغذ A4");

        var dto = Valid();
        dto.ValidTo = dto.ValidFrom.AddDays(-1);

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.Parameters.CreateAsync(dto));

        Assert.Contains(nameof(dto.ValidTo), error.Details.Keys);
    }

    [Fact]
    public async Task Create_RejectsDuplicateBusinessKey()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1001", "کاغذ A4");

        await ctx.Parameters.CreateAsync(Valid());

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.Parameters.CreateAsync(Valid()));

        Assert.Contains("businessKey", error.Details.Keys);
    }

    [Fact]
    public async Task Update_AllowsKeepingSameBusinessKey()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1001", "کاغذ A4");

        var created = await ctx.Parameters.CreateAsync(Valid());

        var dto = Valid();
        dto.ReorderPoint = 250;

        var updated = await ctx.Parameters.UpdateAsync(created.Id, dto);

        Assert.Equal(250m, updated.ReorderPoint);
    }

    [Fact]
    public async Task ChangeStatus_TogglesActiveFlag()
    {
        using var ctx = new TestContext();
        ctx.AddProduct(1, "KLA-1001", "کاغذ A4");

        var created = await ctx.Parameters.CreateAsync(Valid());

        Assert.False((await ctx.Parameters.ChangeStatusAsync(created.Id, false)).IsActive);
        Assert.True((await ctx.Parameters.ChangeStatusAsync(created.Id, true)).IsActive);
    }

    [Fact]
    public async Task Get_ThrowsNotFound_ForUnknownId()
    {
        using var ctx = new TestContext();

        var error = await Assert.ThrowsAsync<BusinessRuleException>(
            () => ctx.Parameters.GetAsync(9999));

        Assert.Equal(ResultCodes.NotFound, error.Code);
    }
}
