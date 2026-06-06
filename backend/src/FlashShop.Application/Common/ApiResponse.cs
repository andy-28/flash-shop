namespace FlashShop.Application.Common;

public sealed class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public List<string>? Errors { get; init; }
    public string? TraceId { get; init; }

    public static ApiResponse<T> Ok(T data, string? message = null, string? traceId = null) => new()
    {
        Success = true,
        Data = data,
        Message = message,
        TraceId = traceId
    };

    public static ApiResponse<T> Fail(string message, List<string>? errors = null, string? traceId = null) => new()
    {
        Success = false,
        Message = message,
        Errors = errors,
        TraceId = traceId
    };
}

public sealed class ApiResponse
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public List<string>? Errors { get; init; }
    public string? TraceId { get; init; }

    public static ApiResponse Ok(string? message = null, string? traceId = null) => new()
    {
        Success = true,
        Message = message,
        TraceId = traceId
    };

    public static ApiResponse Fail(string message, List<string>? errors = null, string? traceId = null) => new()
    {
        Success = false,
        Message = message,
        Errors = errors,
        TraceId = traceId
    };
}
