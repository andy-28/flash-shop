using FlashShop.Application.Common.Interfaces;
using FlashShop.Infrastructure.Caching;
using FlashShop.Infrastructure.Messaging;
using FlashShop.Infrastructure.Persistence;
using FlashShop.Infrastructure.Persistence.Repositories;
using FlashShop.Infrastructure.Security;
using FlashShop.Infrastructure.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace FlashShop.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.AddSingleton<IConnectionMultiplexer>(_ =>
            ConnectionMultiplexer.Connect(configuration.GetConnectionString("Redis") ?? "localhost:6379"));
        services.AddMemoryCache();
        services.AddSingleton<ICacheService>(serviceProvider =>
        {
            var redisConnection = configuration.GetConnectionString("Redis");
            if (!string.IsNullOrWhiteSpace(redisConnection))
            {
                try
                {
                    var redis = serviceProvider.GetRequiredService<IConnectionMultiplexer>();
                    return new RedisCacheService(redis, serviceProvider.GetRequiredService<ILogger<RedisCacheService>>());
                }
                catch (RedisConnectionException)
                {
                    // Local development can keep running without Redis; MemoryCache is a dev-only fallback.
                }
            }

            return new MemoryCacheService(serviceProvider.GetRequiredService<Microsoft.Extensions.Caching.Memory.IMemoryCache>());
        });
        services.AddScoped<IFlashSaleService, FlashSaleService>();

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<IContentRepository, ContentRepository>();
        services.AddScoped<ICouponRepository, CouponRepository>();
        services.AddScoped<IInventoryLogRepository, InventoryLogRepository>();
        services.AddScoped<IAuditLogRepository, AuditLogRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddSingleton<IOrderSettings, OrderSettings>();
        services.AddSingleton<IMessageQueue, InMemoryMessageQueue>();

        return services;
    }
}
