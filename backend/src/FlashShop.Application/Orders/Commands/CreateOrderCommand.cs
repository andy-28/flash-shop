using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Orders.DTOs;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using MediatR;

namespace FlashShop.Application.Orders.Commands;

public sealed class CreateOrderCommand : IRequest<OrderDto>
{
    public Guid UserId { get; set; }
}

public sealed class CreateOrderCommandHandler(
    ICartRepository cartRepository,
    IOrderRepository orderRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateOrderCommand, OrderDto>
{
    public async Task<OrderDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        var cart = await cartRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        if (cart is null || cart.Items.Count == 0)
        {
            throw new BusinessException("Cart is empty.");
        }

        foreach (var cartItem in cart.Items)
        {
            var variant = cartItem.Variant ?? throw new NotFoundException("Product variant was not found.");
            var product = variant.Product ?? throw new NotFoundException("Product was not found.");
            var inventory = variant.Inventory ?? throw new NotFoundException("Inventory was not found.");

            if (variant.Status != "Active" || product.Status != "Active")
            {
                throw new BusinessException($"{product.Name} is no longer available.");
            }

            if (inventory.AvailableStock < cartItem.Quantity)
            {
                throw new BusinessException($"{product.Name} only has {inventory.AvailableStock} items left.");
            }
        }

        var now = DateTime.UtcNow;
        var orderNo = await GenerateOrderNoAsync(now, cancellationToken);
        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            OrderNo = orderNo,
            Status = OrderStatus.Pending,
            CreatedAt = now,
            ExpiredAt = now.AddMinutes(30),
            ShippingFee = 0,
            DiscountAmount = 0
        };

        foreach (var cartItem in cart.Items)
        {
            var variant = cartItem.Variant!;
            var product = variant.Product!;
            var inventory = variant.Inventory!;
            var subtotal = variant.Price * cartItem.Quantity;

            order.Items.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                VariantId = variant.Id,
                ProductName = product.Name,
                SpecName = variant.SpecName,
                UnitPrice = variant.Price,
                Quantity = cartItem.Quantity,
                Subtotal = subtotal
            });

            inventory.AvailableStock -= cartItem.Quantity;
            inventory.FrozenStock += cartItem.Quantity;
            inventory.Version += 1;
            inventory.Logs.Add(new InventoryLog
            {
                Id = Guid.NewGuid(),
                InventoryId = inventory.Id,
                ChangeType = "Freeze",
                Quantity = -cartItem.Quantity,
                Reason = $"Order {orderNo} created",
                OrderId = order.Id,
                CreatedAt = now
            });
        }

        order.TotalAmount = order.Items.Sum(x => x.Subtotal);
        order.FinalAmount = order.TotalAmount - order.DiscountAmount + order.ShippingFee;
        order.Payment = new Payment
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            Method = "Mock",
            Status = PaymentStatus.Pending,
            Amount = order.FinalAmount,
            CreatedAt = now
        };

        await orderRepository.AddAsync(order, cancellationToken);
        foreach (var cartItem in cart.Items.ToArray())
        {
            cartRepository.RemoveItem(cartItem);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var createdOrder = await orderRepository.GetByIdAsync(order.Id, cancellationToken)
            ?? throw new NotFoundException("Order was not found after creation.");
        return OrderMapper.ToDto(createdOrder);
    }

    private async Task<string> GenerateOrderNoAsync(DateTime now, CancellationToken cancellationToken)
    {
        var lastOrderNo = await orderRepository.GetLastOrderNoForDateAsync(now.Date, cancellationToken);
        var next = 1;
        if (!string.IsNullOrWhiteSpace(lastOrderNo))
        {
            var suffix = lastOrderNo.Split('-').LastOrDefault();
            if (int.TryParse(suffix, out var current))
            {
                next = current + 1;
            }
        }

        return $"ORD-{now:yyyyMMdd}-{next:0000}";
    }
}
