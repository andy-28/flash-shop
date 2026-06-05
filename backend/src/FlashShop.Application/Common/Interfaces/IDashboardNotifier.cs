namespace FlashShop.Application.Common.Interfaces;

public interface IDashboardNotifier
{
    Task NotifyOrderCreated(string orderNo, decimal amount, CancellationToken cancellationToken = default);
    Task NotifyOrderPaid(string orderNo, decimal amount, CancellationToken cancellationToken = default);
    Task NotifyOrderCancelled(string orderNo, CancellationToken cancellationToken = default);
    Task NotifyOrderExpired(string orderNo, CancellationToken cancellationToken = default);
    Task NotifyOrderShipped(string orderNo, CancellationToken cancellationToken = default);
    Task NotifyOrderDelivered(string orderNo, CancellationToken cancellationToken = default);
    Task NotifyInventoryAlert(string productName, string specName, int availableStock, CancellationToken cancellationToken = default);
}
