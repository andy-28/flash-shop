using FlashShop.Application.Common.Interfaces;

namespace FlashShop.Api.Services;

public sealed class CacheStatusService(IHttpContextAccessor httpContextAccessor) : ICacheStatusService
{
    public void SetHit()
    {
        SetStatus("HIT");
    }

    public void SetMiss()
    {
        SetStatus("MISS");
    }

    private void SetStatus(string status)
    {
        var context = httpContextAccessor.HttpContext;
        if (context is not null)
        {
            context.Items["X-Cache"] = status;
        }
    }
}
