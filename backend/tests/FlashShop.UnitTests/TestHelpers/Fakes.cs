using FlashShop.Application.Common.Interfaces;

namespace FlashShop.UnitTests.TestHelpers;

public sealed class FakeOrderSettings : IOrderSettings
{
    public int PaymentTimeoutMinutes { get; set; } = 30;
}

public sealed class FakeDashboardNotifier : IDashboardNotifier
{
    public Task NotifyOrderCreated(
        string orderNo,
        decimal amount,
        CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    public Task NotifyOrderPaid(
        string orderNo,
        decimal amount,
        CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    public Task NotifyOrderCancelled(
        string orderNo,
        CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    public Task NotifyOrderExpired(
        string orderNo,
        CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    public Task NotifyOrderShipped(
        string orderNo,
        CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    public Task NotifyOrderDelivered(
        string orderNo,
        CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    public Task NotifyInventoryAlert(
        string productName,
        string specName,
        int availableStock,
        CancellationToken cancellationToken = default)
        => Task.CompletedTask;
}
