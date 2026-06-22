using FlashShop.Api.BackgroundJobs;
using FlashShop.Domain.Enums;
using FlashShop.UnitTests.TestHelpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace FlashShop.UnitTests;

public class OrderTimeoutTests
{
    [Fact]
    public async Task ProcessExpiredOrders_ExpiresOrder_AndReleasesStock()
    {
        var (db, _, orderId, variantId) = PendingOrderSeed.Create(
            stock: 10,
            orderQty: 3);
        await using var _ = db;

        var order = await db.Orders.SingleAsync(candidate => candidate.Id == orderId);
        order.ExpiredAt = DateTime.UtcNow.AddMinutes(-10);
        await db.SaveChangesAsync();
        db.ChangeTracker.Clear();

        var processor = new OrderTimeoutProcessor(
            db,
            new FakeDashboardNotifier(),
            NullLogger<OrderTimeoutProcessor>.Instance);

        var processed = await processor.ProcessExpiredOrders(CancellationToken.None);

        processed.Should().Be(1);
        db.ChangeTracker.Clear();

        var inventory = await db.Inventories
            .SingleAsync(candidate => candidate.VariantId == variantId);
        inventory.AvailableStock.Should().Be(10);
        inventory.FrozenStock.Should().Be(0);

        var expiredOrder = await db.Orders.SingleAsync(candidate => candidate.Id == orderId);
        expiredOrder.Status.Should().Be(OrderStatus.Expired);
        db.InventoryLogs.Should().ContainSingle(log =>
            log.ChangeType == "Release" &&
            log.OrderId == orderId);
    }

    [Fact]
    public async Task ProcessExpiredOrders_IgnoresNonExpiredOrder()
    {
        var (db, _, orderId, _) = PendingOrderSeed.Create(
            stock: 10,
            orderQty: 3);
        await using var _ = db;
        var processor = new OrderTimeoutProcessor(
            db,
            new FakeDashboardNotifier(),
            NullLogger<OrderTimeoutProcessor>.Instance);

        var processed = await processor.ProcessExpiredOrders(CancellationToken.None);

        processed.Should().Be(0);
        db.ChangeTracker.Clear();

        var order = await db.Orders.SingleAsync(candidate => candidate.Id == orderId);
        order.Status.Should().Be(OrderStatus.Pending);
    }
}
