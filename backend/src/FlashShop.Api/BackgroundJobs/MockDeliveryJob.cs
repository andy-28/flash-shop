using FlashShop.Application.Common;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Enums;
using FlashShop.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.BackgroundJobs;

public sealed class MockDeliveryJob(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<MockDeliveryJob> logger) : BackgroundService
{
    private readonly TimeSpan _interval = TimeSpan.FromSeconds(GetConfiguredSeconds(configuration, "ShipmentSettings:DeliveryCheckIntervalSeconds", 60));
    private readonly int _mockDeliveryMinutes = GetConfiguredSeconds(configuration, "ShipmentSettings:MockDeliveryMinutes", 5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("MockDeliveryJob started with interval {IntervalSeconds}s", _interval.TotalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessDeliveriesAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "MockDeliveryJob encountered an error");
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

        logger.LogInformation("MockDeliveryJob stopped");
    }

    private async Task ProcessDeliveriesAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var dashboardNotifier = scope.ServiceProvider.GetRequiredService<IDashboardNotifier>();
        var threshold = DateTime.UtcNow.AddMinutes(-_mockDeliveryMinutes);

        var orders = await dbContext.Orders
            .Include(order => order.Shipment)
            .Where(order =>
                order.Status == OrderStatus.Shipping &&
                order.Shipment != null &&
                order.Shipment.Status == ShipmentStatus.Shipped &&
                order.Shipment.ShippedAt != null &&
                order.Shipment.ShippedAt <= threshold)
            .OrderBy(order => order.Shipment!.ShippedAt)
            .ToListAsync(cancellationToken);

        if (orders.Count == 0)
        {
            return;
        }

        foreach (var order in orders)
        {
            try
            {
                if (!OrderStateMachine.CanTransition(order.Status, OrderStatus.Delivered) || order.Shipment is null)
                {
                    continue;
                }

                order.Status = OrderStatus.Delivered;
                order.Shipment.Status = ShipmentStatus.Delivered;
                order.Shipment.DeliveredAt = DateTime.UtcNow;
                await dbContext.SaveChangesAsync(cancellationToken);
                await dashboardNotifier.NotifyOrderDelivered(order.OrderNo, cancellationToken);
                logger.LogInformation("Mock-delivered order {OrderNo}", order.OrderNo);
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "Failed to mock-deliver order {OrderNo}", order.OrderNo);
            }
        }
    }

    private static int GetConfiguredSeconds(IConfiguration configuration, string key, int fallback)
    {
        return int.TryParse(configuration[key], out var seconds) ? Math.Max(seconds, 5) : fallback;
    }
}
