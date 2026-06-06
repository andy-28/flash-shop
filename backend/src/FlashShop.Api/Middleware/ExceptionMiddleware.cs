using System.Text.Json;
using FluentValidation;

namespace FlashShop.Api.Middleware;

public sealed class ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var traceId = context.TraceIdentifier;
        var (statusCode, response) = exception switch
        {
            BusinessException businessException => (
                StatusCodes.Status400BadRequest,
                ApiResponse.Fail(businessException.Message, traceId: traceId)),
            ValidationException validationException => (
                StatusCodes.Status400BadRequest,
                ApiResponse.Fail("Validation failed", validationException.Errors.Select(error => error.ErrorMessage).ToList(), traceId)),
            NotFoundException notFoundException => (
                StatusCodes.Status404NotFound,
                ApiResponse.Fail(notFoundException.Message, traceId: traceId)),
            ConcurrencyException concurrencyException => (
                StatusCodes.Status409Conflict,
                ApiResponse.Fail(concurrencyException.Message, traceId: traceId)),
            UnauthorizedAccessException => (
                StatusCodes.Status401Unauthorized,
                ApiResponse.Fail("Unauthorized", traceId: traceId)),
            _ => (
                StatusCodes.Status500InternalServerError,
                ApiResponse.Fail("An unexpected error occurred", traceId: traceId))
        };

        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception: {Message}", exception.Message);
        }
        else
        {
            logger.LogWarning("Request error: {Type} - {Message}", exception.GetType().Name, exception.Message);
        }

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        }));
    }
}
