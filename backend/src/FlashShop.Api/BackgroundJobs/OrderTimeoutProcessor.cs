using FlashShop.Application.Common;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using FlashShop.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.BackgroundJobs;

public sealed class OrderTimeoutProcessor(
    AppDbContext dbContext,
    IDashboardNotifier dashboardNotifier,
    ILogger<OrderTimeoutProcessor> logger) : IOrderTimeoutProcessor
{
    public async Task<int> ProcessExpiredOrders(CancellationToken cancellationToken)
    {
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
            return 0;
        }

        logger.LogInformation("Found {Count} expired orders to cancel at {CheckedAt}", expiredOrders.Count, now);

        var processedCount = 0;
        foreach (var order in expiredOrders)
        {
            try
            {
                await CancelExpiredOrderAsync(order, cancellationToken);
                processedCount += 1;
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

        return processedCount;
    }

    private async Task CancelExpiredOrderAsync(Order order, CancellationToken cancellationToken)
    {
        if (!OrderStateMachine.CanTransition(order.Status, OrderStatus.Expired))
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

        if (order.OrderType == "PreOrder")
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return;
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

            inventory.Release(item.Quantity);
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
}
