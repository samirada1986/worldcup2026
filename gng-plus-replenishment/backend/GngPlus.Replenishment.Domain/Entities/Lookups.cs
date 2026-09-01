namespace GngPlus.Replenishment.Domain.Entities;

/// <summary>کالا</summary>
public class Product
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int ProductGroupId { get; set; }
    public ProductGroup? ProductGroup { get; set; }
    /// <summary>ماهیت کالا (مصرفی / سرمایه‌ای / ...)</summary>
    public int NatureId { get; set; }
    public ProductNature? Nature { get; set; }
    public int UnitOfMeasureId { get; set; }
    public UnitOfMeasure? UnitOfMeasure { get; set; }
    public bool IsActive { get; set; } = true;
}

/// <summary>گروه کالا</summary>
public class ProductGroup
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>ماهیت کالا</summary>
public class ProductNature
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>واحد سنجش</summary>
public class UnitOfMeasure
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>انبار</summary>
public class Warehouse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int SiteId { get; set; }
    public Site? Site { get; set; }
}

/// <summary>سایت</summary>
public class Site
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>محدوده پارامتر (سطحی که پارامتر روی آن تعریف می‌شود)</summary>
public class ParameterScope
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>نوع درخواست</summary>
public class RequestType
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>طبقه‌بندی درخواست</summary>
public class RequestClassification
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>پارامتر کنترل کیفیت</summary>
public class QualityControlParameter
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}

/// <summary>طرح آزمایش</summary>
public class TestPlan
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
}
