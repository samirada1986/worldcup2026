using GngPlus.Replenishment.Domain.Enums;

namespace GngPlus.Replenishment.Application.Common;

/// <summary>
/// نتیجه ساخت‌یافته ارزیابی یک قاعده کسب‌وکار.
/// طبق نیازمندی، هرگز صرفاً رشته بازگردانده نمی‌شود.
/// </summary>
public sealed record EvaluationResult(
    EvaluationOutcome Outcome,
    string Code,
    string Message)
{
    public static EvaluationResult Proceed(string code = "", string message = "")
        => new(EvaluationOutcome.Proceed, code, message);

    public static EvaluationResult Warning(string code, string message)
        => new(EvaluationOutcome.Warning, code, message);

    public static EvaluationResult RequireReview(string code, string message)
        => new(EvaluationOutcome.RequireReview, code, message);

    public static EvaluationResult Skip(string code, string message)
        => new(EvaluationOutcome.Skip, code, message);

    public static EvaluationResult Error(string code, string message)
        => new(EvaluationOutcome.Error, code, message);

    public bool IsBlocking => Outcome is EvaluationOutcome.Skip or EvaluationOutcome.Error;
}

/// <summary>خطای کسب‌وکار با کد و پیام فارسی — در میان‌افزار به پاسخ استاندارد تبدیل می‌شود</summary>
public class BusinessRuleException : Exception
{
    public string Code { get; }
    public IDictionary<string, object?> Details { get; }

    public BusinessRuleException(
        string code, string message,
        IDictionary<string, object?>? details = null, Exception? innerException = null)
        : base(message, innerException)
    {
        Code = code;
        Details = details ?? new Dictionary<string, object?>();
    }
}
