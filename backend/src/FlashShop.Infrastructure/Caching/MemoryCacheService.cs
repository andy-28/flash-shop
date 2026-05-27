using System.Collections.Concurrent;
using FlashShop.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace FlashShop.Infrastructure.Caching;

public sealed class MemoryCacheService(IMemoryCache cache) : ICacheService
{
    private readonly ConcurrentDictionary<string, byte> _keys = new();

    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(cache.TryGetValue(key, out T? value) ? value : default);
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken cancellationToken = default)
    {
        cache.Set(key, value, ttl ?? TimeSpan.FromMinutes(10));
        _keys[key] = 0;
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        cache.Remove(key);
        _keys.TryRemove(key, out _);
        return Task.CompletedTask;
    }

    public Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        foreach (var key in _keys.Keys.Where(key => key.StartsWith(prefix, StringComparison.Ordinal)))
        {
            cache.Remove(key);
            _keys.TryRemove(key, out _);
        }

        return Task.CompletedTask;
    }
}
