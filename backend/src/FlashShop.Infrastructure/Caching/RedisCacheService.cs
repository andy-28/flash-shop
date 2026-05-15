using System.Text.Json;
using FlashShop.Application.Common.Interfaces;
using StackExchange.Redis;

namespace FlashShop.Infrastructure.Caching;

public sealed class RedisCacheService(IConnectionMultiplexer redis) : ICacheService
{
    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        var value = await redis.GetDatabase().StringGetAsync(key);
        return value.HasValue ? JsonSerializer.Deserialize<T>(value!) : default;
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken cancellationToken = default)
    {
        var serialized = JsonSerializer.Serialize(value);
        var database = redis.GetDatabase();
        await database.StringSetAsync(key, serialized);

        if (ttl.HasValue)
        {
            await database.KeyExpireAsync(key, ttl.Value);
        }
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        return redis.GetDatabase().KeyDeleteAsync(key);
    }
}
