using FlashShop.Application.Common.Interfaces;
using FlashShop.Infrastructure.Caching;
using FlashShop.Infrastructure.Messaging;
using FlashShop.Infrastructure.Persistence;
using FlashShop.Infrastructure.Persistence.Repositories;
using FlashShop.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace FlashShop.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddMemoryCache();
        services.AddSingleton<ICacheService>(serviceProvider =>
        {
            var redisConnection = configuration.GetConnectionString("Redis");
            if (!string.IsNullOrWhiteSpace(redisConnection))
            {
                try
                {
                    var redis = ConnectionMultiplexer.Connect(redisConnection);
                    return new RedisCacheService(redis);
                }
                catch (RedisConnectionException)
                {
                    // Local development can keep running without Redis; MemoryCache is a dev-only fallback.
                }
            }

            return new MemoryCacheService(serviceProvider.GetRequiredService<Microsoft.Extensions.Caching.Memory.IMemoryCache>());
        });

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IContentRepository, ContentRepository>();
        services.AddScoped<IInventoryLogRepository, InventoryLogRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddSingleton<IMessageQueue, InMemoryMessageQueue>();

        return services;
    }
}
