using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Orders.DTOs;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using MediatR;

namespace FlashShop.Application.Orders.Commands;

public sealed class CancelOrderCommand : IRequest<OrderDto>
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
}

public sealed class CancelOrderCommandHandler(
    IOrderRepository orderRepository,
    IProductRepository productRepository,
    IInventoryLogRepository inventoryLogRepository,
    IDashboardNotifier dashboardNotifier,
    IUnitOfWork unitOfWork) : IRequestHandler<CancelOrderCommand, OrderDto>
{
    public async Task<OrderDto> Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order was not found.");

        if (order.UserId != request.UserId)
        {
            throw new NotFoundException("Order was not found.");
        }

        OrderStateMachine.ValidateTransition(order.Status, OrderStatus.Cancelled);

        var now = DateTime.UtcNow;
        order.Status = OrderStatus.Cancelled;
        if (order.Payment is not null)
        {
            order.Payment.Status = PaymentStatus.Failed;
        }

        foreach (var item in order.Items)
        {
            var variant = await productRepository.GetVariantAsync(item.VariantId, cancellationToken)
                ?? throw new NotFoundException("Product variant was not found.");
            var inventory = variant.Inventory ?? throw new NotFoundException("Inventory was not found.");
            if (inventory.FrozenStock < item.Quantity)
            {
                throw new BusinessException("Frozen stock is not enough to cancel this order.");
            }

            inventory.FrozenStock -= item.Quantity;
            inventory.AvailableStock += item.Quantity;
            inventory.Version += 1;
            await inventoryLogRepository.AddAsync(new InventoryLog
            {
                Id = Guid.NewGuid(),
                InventoryId = inventory.Id,
                ChangeType = "Release",
                Quantity = item.Quantity,
                Reason = $"Order {order.OrderNo} cancelled by user",
                OrderId = order.Id,
                CreatedAt = now
            }, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await dashboardNotifier.NotifyOrderCancelled(order.OrderNo, cancellationToken);

        var updatedOrder = await orderRepository.GetByIdAsync(order.Id, cancellationToken)
            ?? throw new NotFoundException("Order was not found.");
        return OrderMapper.ToDto(updatedOrder);
    }
}
