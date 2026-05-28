using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using FlashShop.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.BackgroundJobs;

public sealed class FlashSaleOrderWorker(
    FlashSaleOrderChannel channel,
    IServiceScopeFactory scopeFactory,
    ILogger<FlashSaleOrderWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("FlashSaleOrderWorker started");

        await foreach (var message in channel.Reader.ReadAllAsync(stoppingToken))
        {
            try
            {
                await PersistOrderAsync(message, stoppingToken);
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Failed to persist flash sale order for sale {SaleId}", message.SaleId);
            }
        }
    }

    private async Task PersistOrderAsync(FlashSaleOrderMessage message, CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var dashboardNotifier = scope.ServiceProvider.GetRequiredService<IDashboardNotifier>();

        var variant = await dbContext.ProductVariants
            .Include(candidate => candidate.Product)
            .FirstAsync(candidate => candidate.Id == message.VariantId, cancellationToken);
        var inventory = await dbContext.Inventories
            .FirstAsync(candidate => candidate.VariantId == message.VariantId, cancellationToken);
        var sale = await dbContext.FlashSales
            .FirstAsync(candidate => candidate.Id == message.SaleId, cancellationToken);

        var orderNo = await GenerateOrderNoAsync(dbContext, message.PurchasedAt, cancellationToken);
        var finalAmount = message.UnitPrice * message.Quantity;
        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = message.UserId,
            OrderNo = orderNo,
            Status = OrderStatus.Pending,
            TotalAmount = finalAmount,
            DiscountAmount = 0,
            ShippingFee = 0,
            FinalAmount = finalAmount,
            CreatedAt = message.PurchasedAt,
            ExpiredAt = message.PurchasedAt.AddMinutes(30),
            Payment = new Payment
            {
                Id = Guid.NewGuid(),
                Method = "Mock",
                Status = PaymentStatus.Pending,
                Amount = finalAmount,
                CreatedAt = message.PurchasedAt
            }
        };

        order.Items.Add(new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            VariantId = message.VariantId,
            ProductName = variant.Product?.Name ?? "Flash sale product",
            SpecName = variant.SpecName,
            UnitPrice = message.UnitPrice,
            Quantity = message.Quantity,
            Subtotal = finalAmount
        });

        sale.SoldCount += message.Quantity;
        inventory.AvailableStock -= message.Quantity;
        inventory.FrozenStock += message.Quantity;
        inventory.Version += 1;

        dbContext.Orders.Add(order);
        dbContext.InventoryLogs.Add(new InventoryLog
        {
            Id = Guid.NewGuid(),
            InventoryId = inventory.Id,
            ChangeType = "Freeze",
            Quantity = -message.Quantity,
            Reason = $"Flash sale order {order.OrderNo}",
            OrderId = order.Id,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync(cancellationToken);
        await dashboardNotifier.NotifyOrderCreated(order.OrderNo, order.FinalAmount, cancellationToken);
        logger.LogInformation("Flash sale order persisted: {OrderNo}", order.OrderNo);
    }

    private static async Task<string> GenerateOrderNoAsync(AppDbContext dbContext, DateTime now, CancellationToken cancellationToken)
    {
        var prefix = $"ORD-{now:yyyyMMdd}-";
        var lastOrderNo = await dbContext.Orders
            .Where(order => order.OrderNo.StartsWith(prefix))
            .OrderByDescending(order => order.OrderNo)
            .Select(order => order.OrderNo)
            .FirstOrDefaultAsync(cancellationToken);

        var next = 1;
        var suffix = lastOrderNo?.Split('-').LastOrDefault();
        if (int.TryParse(suffix, out var current))
        {
            next = current + 1;
        }

        return $"{prefix}{next:0000}";
    }
}
