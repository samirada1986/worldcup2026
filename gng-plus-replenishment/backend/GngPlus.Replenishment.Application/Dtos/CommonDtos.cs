namespace GngPlus.Replenishment.Application.Dtos;

/// <summary>پوشش استاندارد پاسخ API</summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Code { get; set; }
    public string? Message { get; set; }
    public IDictionary<string, object?>? Details { get; set; }

    public static ApiResponse<T> Ok(T data) => new() { Success = true, Data = data };

    public static ApiResponse<T> Fail(string code, string message, IDictionary<string, object?>? details = null)
        => new() { Success = false, Code = code, Message = message, Details = details };
}

/// <summary>پاسخ خطای استاندارد بدون داده</summary>
public class ApiErrorResponse
{
    public bool Success { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public IDictionary<string, object?> Details { get; set; } = new Dictionary<string, object?>();
}

/// <summary>آیتم عمومی لیست‌های انتخابی</summary>
public class LookupItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    /// <summary>شناسه والد — مثلا سایت برای انبار یا گروه برای کالا</summary>
    public int? ParentId { get; set; }
}

/// <summary>آیتم لیست انتخابی برای مقادیر ثابت (enum)</summary>
public class EnumItemDto
{
    public int Value { get; set; }
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
