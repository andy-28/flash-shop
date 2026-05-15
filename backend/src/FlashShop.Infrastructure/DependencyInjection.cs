using FlashShop.Application.Common.Interfaces;
using FlashShop.Infrastructure.Caching;
using FlashShop.Infrastructure.Messaging;
using FlashShop.Infrastructure.Persistence;
using FlashShop.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;

namespace FlashShop.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection")));

        services.AddSingleton<IConnectionMultiplexer>(_ =>
            ConnectionMultiplexer.Connect(configuration.GetConnectionString("Redis") ?? "localhost:6379"));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<ProductRepository>();
        services.AddScoped<OrderRepository>();
        services.AddSingleton<ICacheService, RedisCacheService>();
        services.AddSingleton<IMessageQueue, InMemoryMessageQueue>();

        return services;
    }
}
