using FlashShop.Application.Orders.Commands;
using FlashShop.Domain.Enums;
using FlashShop.Infrastructure.Persistence;
using FlashShop.Infrastructure.Persistence.Repositories;
using FlashShop.UnitTests.TestHelpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FlashShop.UnitTests;

public class PaymentTests
{
    [Fact]
    public async Task ProcessPayment_MovesFrozenToSold()
    {
        var (db, userId, orderId, variantId) = PendingOrderSeed.Create(
            stock: 10,
            orderQty: 3);
        await using var _ = db;
        var handler = CreateHandler(db);

        await handler.Handle(new ProcessPaymentCommand
        {
            OrderId = orderId,
            UserId = userId
        }, CancellationToken.None);

        db.ChangeTracker.Clear();
        var inventory = await db.Inventories
            .SingleAsync(candidate => candidate.VariantId == variantId);
        inventory.FrozenStock.Should().Be(0);
        inventory.SoldCount.Should().Be(3);

        var order = await db.Orders.SingleAsync(candidate => candidate.Id == orderId);
        order.Status.Should().Be(OrderStatus.Paid);
    }

    [Fact]
    public async Task ProcessPayment_WritesSoldLog()
    {
        var (db, userId, orderId, _) = PendingOrderSeed.Create(
            stock: 10,
            orderQty: 3);
        await using var _ = db;
        var handler = CreateHandler(db);

        await handler.Handle(new ProcessPaymentCommand
        {
            OrderId = orderId,
            UserId = userId
        }, CancellationToken.None);

        db.ChangeTracker.Clear();
        db.InventoryLogs.Should().ContainSingle(log =>
            log.ChangeType == "Sold" &&
            log.Quantity == 3 &&
            log.OrderId == orderId);
    }

    private static ProcessPaymentCommandHandler CreateHandler(AppDbContext db)
    {
        return new ProcessPaymentCommandHandler(
            new OrderRepository(db),
            new ProductRepository(db),
            new InventoryLogRepository(db),
            new FakeDashboardNotifier(),
            new UnitOfWork(db));
    }
}
