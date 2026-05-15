using System.Net;
using FluentValidation;
using FlashShop.Application.Common.Exceptions;

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
            logger.LogError(exception, "Unhandled request exception");
            await WriteErrorAsync(context, exception);
        }
    }

    private static async Task WriteErrorAsync(HttpContext context, Exception exception)
    {
        var (statusCode, code, message) = exception switch
        {
            NotFoundException => (HttpStatusCode.NotFound, "NOT_FOUND", exception.Message),
            BusinessException => (HttpStatusCode.BadRequest, "BUSINESS_ERROR", exception.Message),
            ConcurrencyException => (HttpStatusCode.Conflict, "CONCURRENCY_ERROR", exception.Message),
            ValidationException => (HttpStatusCode.BadRequest, "VALIDATION_ERROR", exception.Message),
            _ => (HttpStatusCode.InternalServerError, "INTERNAL_SERVER_ERROR", "Unexpected server error")
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = (int)statusCode;
        await context.Response.WriteAsJsonAsync(new { code, message });
    }
}
