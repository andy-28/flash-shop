using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using FlashShop.Infrastructure.Persistence;

namespace FlashShop.UnitTests.TestHelpers;

public static class PendingOrderSeed
{
    public static (AppDbContext Db, Guid UserId, Guid OrderId, Guid VariantId) Create(
        int stock,
        int orderQty)
    {
        var db = TestDb.Create();
        var now = DateTime.UtcNow;
        var userId = Guid.NewGuid();
        var productId = Guid.NewGuid();
        var variantId = Guid.NewGuid();
        var orderId = Guid.NewGuid();

        var user = new User
        {
            Id = userId,
            Email = $"buyer-{userId:N}@test.com",
            PasswordHash = "x",
            Name = "Buyer",
            Role = UserRole.Customer,
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
            Sku = $"SKU-{variantId:N}",
            SpecName = "M",
            Price = 100m,
            Status = "Active",
            CreatedAt = now
        };
        var inventory = new Inventory
        {
            Id = Guid.NewGuid(),
            VariantId = variantId,
            TotalStock = stock,
            AvailableStock = stock - orderQty,
            FrozenStock = orderQty,
            SoldCount = 0,
            Version = 1
        };
        var order = new Order
        {
            Id = orderId,
            UserId = userId,
            OrderNo = $"ORD-{now:yyyyMMdd}-0001",
            OrderType = "Normal",
            Status = OrderStatus.Pending,
            TotalAmount = 100m * orderQty,
            DiscountAmount = 0,
            ShippingFee = 0,
            FinalAmount = 100m * orderQty,
            CreatedAt = now,
            ExpiredAt = now.AddMinutes(30)
        };
        var orderItem = new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            VariantId = variantId,
            ProductName = product.Name,
            SpecName = variant.SpecName,
            UnitPrice = variant.Price,
            Quantity = orderQty,
            Subtotal = variant.Price * orderQty
        };
        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            OrderId = orderId,
            Method = "Mock",
            Status = PaymentStatus.Pending,
            Amount = order.FinalAmount,
            CreatedAt = now
        };

        db.AddRange(user, product, variant, inventory, order, orderItem, payment);
        db.SaveChanges();
        db.ChangeTracker.Clear();

        return (db, userId, orderId, variantId);
    }
}
