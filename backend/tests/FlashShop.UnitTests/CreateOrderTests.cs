using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Orders.Commands;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using FlashShop.Infrastructure.Persistence;
using FlashShop.Infrastructure.Persistence.Repositories;
using FlashShop.UnitTests.TestHelpers;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FlashShop.UnitTests;

public class CreateOrderTests
{
    private static (AppDbContext Db, Guid UserId, Guid VariantId) SeedCartWithStock(
        int stock,
        int cartQty)
    {
        var db = TestDb.Create();
        var now = DateTime.UtcNow;
        var userId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var variantId = Guid.NewGuid();
        var cartId = Guid.NewGuid();

        var user = new User
        {
            Id = userId,
            Email = $"buyer-{userId:N}@test.com",
            Name = "Buyer",
            Role = UserRole.Customer,
            PasswordHash = "x",
            CreatedAt = now
        };
        var product = new Product
        {
            Id = productId,
            Name = "Test",
            Description = "Test product",
            Category = "T",
            Status = "Active",
            CreatedAt = now,
            UpdatedAt = now
        };
        var variant = new ProductVariant
        {
            Id = variantId,
            ProductId = productId,
            SpecName = "M",
            Sku = $"SKU-{variantId:N}",
            Price = 100m,
            Status = "Active",
            CreatedAt = now
        };
        var inventory = new Inventory
        {
            Id = Guid.NewGuid(),
            VariantId = variantId,
            TotalStock = stock,
            AvailableStock = stock,
            FrozenStock = 0,
            SoldCount = 0,
            Version = 0
        };
        var cart = new Cart
        {
            Id = cartId,
            UserId = userId,
            UpdatedAt = now
        };
        var cartItem = new CartItem
        {
            Id = Guid.NewGuid(),
            CartId = cartId,
            VariantId = variantId,
            Quantity = cartQty,
            AddedAt = now
        };

        db.AddRange(user, product, variant, inventory, cart, cartItem);
        db.SaveChanges();
        db.ChangeTracker.Clear();

        return (db, userId, variantId);
    }

    [Fact]
    public async Task CreateOrder_FreezesStock()
    {
        var (db, userId, variantId) = SeedCartWithStock(stock: 10, cartQty: 3);
        await using var _ = db;
        var handler = CreateHandler(db);

        await handler.Handle(
            new CreateOrderCommand { UserId = userId },
            CancellationToken.None);

        var inventory = await db.Inventories
            .SingleAsync(candidate => candidate.VariantId == variantId);
        inventory.AvailableStock.Should().Be(7);
        inventory.FrozenStock.Should().Be(3);
    }

    [Fact]
    public async Task CreateOrder_CreatesOrderSnapshot()
    {
        var (db, userId, _) = SeedCartWithStock(stock: 10, cartQty: 2);
        await using var _ = db;
        var handler = CreateHandler(db);

        await handler.Handle(
            new CreateOrderCommand { UserId = userId },
            CancellationToken.None);

        db.Orders.Should().HaveCount(1);
        var orderItem = await db.OrderItems.SingleAsync();
        orderItem.UnitPrice.Should().Be(100m);
        orderItem.Quantity.Should().Be(2);
    }

    [Fact]
    public async Task CreateOrder_ThrowsWhenInsufficientStock()
    {
        var (db, userId, _) = SeedCartWithStock(stock: 1, cartQty: 5);
        await using var _ = db;
        var handler = CreateHandler(db);

        var act = () => handler.Handle(
            new CreateOrderCommand { UserId = userId },
            CancellationToken.None);

        await act.Should().ThrowAsync<BusinessException>();
    }

    [Fact]
    public async Task CreateOrder_WritesInventoryLog()
    {
        var (db, userId, _) = SeedCartWithStock(stock: 10, cartQty: 3);
        await using var _ = db;
        var handler = CreateHandler(db);

        await handler.Handle(
            new CreateOrderCommand { UserId = userId },
            CancellationToken.None);

        db.InventoryLogs.Should().ContainSingle(log =>
            log.ChangeType == "Freeze" &&
            log.Quantity == -3);
    }

    private static CreateOrderCommandHandler CreateHandler(AppDbContext db)
    {
        return new CreateOrderCommandHandler(
            new CartRepository(db),
            new OrderRepository(db),
            new CouponRepository(db),
            new InventoryLogRepository(db),
            new FakeOrderSettings(),
            new FakeDashboardNotifier(),
            new UnitOfWork(db));
    }
}
