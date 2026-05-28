using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using FlashShop.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.BackgroundJobs;

public sealed class OrderTimeoutJob(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<OrderTimeoutJob> logger) : BackgroundService
{
    private readonly TimeSpan _interval = TimeSpan.FromSeconds(GetConfiguredIntervalSeconds(configuration));

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("OrderTimeoutJob started with interval {IntervalSeconds}s", _interval.TotalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessExpiredOrdersAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "OrderTimeoutJob encountered an error");
            }

            try
            {
                await Task.Delay(_interval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }

        logger.LogInformation("OrderTimeoutJob stopped");
    }

    private async Task ProcessExpiredOrdersAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var dashboardNotifier = scope.ServiceProvider.GetRequiredService<IDashboardNotifier>();
        var now = DateTime.UtcNow;

        var expiredOrders = await dbContext.Orders
            .Include(order => order.Items)
            .Include(order => order.Payment)
            .Where(order => order.Status == OrderStatus.Pending && order.ExpiredAt < now)
            .OrderBy(order => order.ExpiredAt)
            .ToListAsync(cancellationToken);

        if (expiredOrders.Count == 0)
        {
            logger.LogDebug("OrderTimeoutJob found no expired pending orders at {CheckedAt}", now);
            return;
        }

        logger.LogInformation("Found {Count} expired orders to cancel at {CheckedAt}", expiredOrders.Count, now);

        foreach (var order in expiredOrders)
        {
            try
            {
                await CancelExpiredOrderAsync(dbContext, order, cancellationToken);
                await dashboardNotifier.NotifyOrderExpired(order.OrderNo, cancellationToken);
                logger.LogInformation(
                    "Auto-cancelled expired order {OrderNo} (created {CreatedAt}, expired {ExpiredAt})",
                    order.OrderNo,
                    order.CreatedAt,
                    order.ExpiredAt);
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Failed to cancel expired order {OrderNo}", order.OrderNo);
            }
        }
    }

    private async Task CancelExpiredOrderAsync(AppDbContext dbContext, Order order, CancellationToken cancellationToken)
    {
        if (order.Status != OrderStatus.Pending)
        {
            logger.LogDebug("Skipped order {OrderNo} because status is {Status}", order.OrderNo, order.Status);
            return;
        }

        var now = DateTime.UtcNow;
        order.Status = OrderStatus.Expired;

        if (order.Payment is not null)
        {
            order.Payment.Status = PaymentStatus.Failed;
        }

        foreach (var item in order.Items)
        {
            var inventory = await dbContext.Inventories
                .FirstOrDefaultAsync(candidate => candidate.VariantId == item.VariantId, cancellationToken);

            if (inventory is null)
            {
                logger.LogWarning(
                    "Inventory was not found while expiring order {OrderNo}, variant {VariantId}",
                    order.OrderNo,
                    item.VariantId);
                continue;
            }

            if (inventory.FrozenStock < item.Quantity)
            {
                throw new InvalidOperationException(
                    $"Inventory {inventory.Id} frozen stock is not enough to expire order {order.OrderNo}.");
            }

            inventory.FrozenStock -= item.Quantity;
            inventory.AvailableStock += item.Quantity;
            inventory.Version += 1;

            dbContext.InventoryLogs.Add(new InventoryLog
            {
                Id = Guid.NewGuid(),
                InventoryId = inventory.Id,
                ChangeType = "Release",
                Quantity = item.Quantity,
                Reason = $"Order {order.OrderNo} expired (auto-cancelled)",
                OrderId = order.Id,
                CreatedAt = now
            });
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static int GetConfiguredIntervalSeconds(IConfiguration configuration)
    {
        var configuredValue = configuration["OrderSettings:TimeoutCheckIntervalSeconds"];
        return int.TryParse(configuredValue, out var seconds) ? Math.Max(seconds, 5) : 60;
    }
}
