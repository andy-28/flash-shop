using System.Text.Json;
using FlashShop.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace FlashShop.Infrastructure.Caching;

public sealed class RedisCacheService(IConnectionMultiplexer redis, ILogger<RedisCacheService> logger) : ICacheService
{
    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var value = await redis.GetDatabase().StringGetAsync(key);
            return value.HasValue ? JsonSerializer.Deserialize<T>(value!) : default;
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis GET failed for key {Key}, falling back to database", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? ttl = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var serialized = JsonSerializer.Serialize(value);
            await redis.GetDatabase().StringSetAsync(key, serialized, ttl ?? TimeSpan.FromMinutes(5));
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis SET failed for key {Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            await redis.GetDatabase().KeyDeleteAsync(key);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis DELETE failed for key {Key}", key);
        }
    }

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken cancellationToken = default)
    {
        try
        {
            var endpoint = redis.GetEndPoints().FirstOrDefault();
            if (endpoint is null)
            {
                return;
            }

            var server = redis.GetServer(endpoint);
            var keys = server.Keys(pattern: $"{prefix}*").ToArray();
            if (keys.Length > 0)
            {
                await redis.GetDatabase().KeyDeleteAsync(keys);
            }
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Redis prefix DELETE failed for prefix {Prefix}", prefix);
        }
    }
}
