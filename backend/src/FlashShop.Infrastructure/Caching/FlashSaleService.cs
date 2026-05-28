using System.Text.Json;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;

namespace FlashShop.Infrastructure.Caching;

public sealed class FlashSaleService(
    IConnectionMultiplexer redis,
    ILogger<FlashSaleService> logger) : IFlashSaleService
{
    private const string PurchaseScript = """
        local userPurchased = redis.call('GET', KEYS[2])
        if userPurchased then
            return -1
        end

        local stock = tonumber(redis.call('GET', KEYS[1]))
        if stock == nil or stock <= 0 then
            return 0
        end

        local quantity = tonumber(ARGV[1])
        if stock < quantity then
            return 0
        end

        redis.call('DECRBY', KEYS[1], quantity)
        redis.call('SET', KEYS[2], '1')
        return tonumber(redis.call('GET', KEYS[1]))
        """;

    public async Task LoadStockToRedisAsync(Guid saleId, int stock, CancellationToken cancellationToken = default)
    {
        await redis.GetDatabase().StringSetAsync(StockKey(saleId), stock);
        logger.LogInformation("Flash sale {SaleId} loaded {Stock} stock to Redis", saleId, stock);
    }

    public async Task LoadSaleInfoToRedisAsync(FlashSale sale, CancellationToken cancellationToken = default)
    {
        var info = JsonSerializer.Serialize(new
        {
            sale.Id,
            sale.Title,
            sale.FlashPrice,
            sale.TotalStock,
            sale.PerUserLimit,
            sale.StartAt,
            sale.EndAt
        });

        await redis.GetDatabase().StringSetAsync(InfoKey(sale.Id), info);
    }

    public async Task<FlashSalePurchaseAttempt> TryPurchaseAsync(
        Guid saleId,
        Guid userId,
        int quantity,
        int perUserLimit,
        CancellationToken cancellationToken = default)
    {
        var result = await redis.GetDatabase().ScriptEvaluateAsync(
            PurchaseScript,
            new RedisKey[] { StockKey(saleId), UserKey(saleId, userId) },
            new RedisValue[] { quantity, perUserLimit });

        var remaining = (int)(long)result;
        return remaining switch
        {
            -1 => new FlashSalePurchaseAttempt(FlashSalePurchaseResult.AlreadyPurchased, 0),
            0 => new FlashSalePurchaseAttempt(FlashSalePurchaseResult.SoldOut, 0),
            _ => new FlashSalePurchaseAttempt(FlashSalePurchaseResult.Success, remaining)
        };
    }

    public async Task<int> GetRemainingStockAsync(Guid saleId, CancellationToken cancellationToken = default)
    {
        var value = await redis.GetDatabase().StringGetAsync(StockKey(saleId));
        return value.HasValue && int.TryParse(value, out var stock) ? stock : 0;
    }

    private static string StockKey(Guid saleId) => $"flash_sale:{saleId}:stock";
    private static string UserKey(Guid saleId, Guid userId) => $"flash_sale:{saleId}:user:{userId}";
    private static string InfoKey(Guid saleId) => $"flash_sale:{saleId}:info";
}
