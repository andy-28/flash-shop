namespace FlashShop.Api.Middleware;

public sealed class CacheHeaderMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        context.Response.OnStarting(() =>
        {
            if (context.Items.TryGetValue("X-Cache", out var cacheStatus) && cacheStatus is string status)
            {
                context.Response.Headers["X-Cache"] = status;
            }

            return Task.CompletedTask;
        });

        await next(context);
    }
}
