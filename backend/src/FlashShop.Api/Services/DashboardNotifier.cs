using FlashShop.Api.Hubs;
using FlashShop.Application.Common.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace FlashShop.Api.Services;

public sealed class DashboardNotifier(IHubContext<DashboardHub> hubContext) : IDashboardNotifier
{
    public Task NotifyOrderCreated(string orderNo, decimal amount, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients.All.SendAsync("OrderCreated", new
        {
            OrderNo = orderNo,
            Amount = amount,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);
    }

    public Task NotifyOrderPaid(string orderNo, decimal amount, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients.All.SendAsync("OrderPaid", new
        {
            OrderNo = orderNo,
            Amount = amount,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);
    }

    public Task NotifyOrderCancelled(string orderNo, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients.All.SendAsync("OrderCancelled", new
        {
            OrderNo = orderNo,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);
    }

    public Task NotifyOrderExpired(string orderNo, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients.All.SendAsync("OrderExpired", new
        {
            OrderNo = orderNo,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);
    }

    public Task NotifyOrderShipped(string orderNo, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients.All.SendAsync("OrderShipped", new
        {
            OrderNo = orderNo,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);
    }

    public Task NotifyOrderDelivered(string orderNo, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients.All.SendAsync("OrderDelivered", new
        {
            OrderNo = orderNo,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);
    }

    public Task NotifyInventoryAlert(string productName, string specName, int availableStock, CancellationToken cancellationToken = default)
    {
        return hubContext.Clients.All.SendAsync("InventoryAlert", new
        {
            ProductName = productName,
            SpecName = specName,
            AvailableStock = availableStock,
            Timestamp = DateTime.UtcNow
        }, cancellationToken);
    }
}
