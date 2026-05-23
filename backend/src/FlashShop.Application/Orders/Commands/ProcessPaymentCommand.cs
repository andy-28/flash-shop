using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Orders.DTOs;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using MediatR;

namespace FlashShop.Application.Orders.Commands;

public sealed class ProcessPaymentCommand : IRequest<OrderDto>
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
    public string Method { get; set; } = "Mock";
}

public sealed class ProcessPaymentCommandHandler(
    IOrderRepository orderRepository,
    IProductRepository productRepository,
    IInventoryLogRepository inventoryLogRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<ProcessPaymentCommand, OrderDto>
{
    public async Task<OrderDto> Handle(ProcessPaymentCommand request, CancellationToken cancellationToken)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order was not found.");

        if (order.UserId != request.UserId)
        {
            throw new NotFoundException("Order was not found.");
        }

        if (order.Status != OrderStatus.Pending)
        {
            throw new BusinessException("Only pending orders can be paid.");
        }

        if (DateTime.UtcNow >= order.ExpiredAt)
        {
            throw new BusinessException("Order has expired.");
        }

        var now = DateTime.UtcNow;
        var payment = order.Payment ?? throw new NotFoundException("Payment was not found.");
        payment.Status = PaymentStatus.Success;
        payment.PaidAt = now;
        payment.TransactionId = $"MOCK-{Guid.NewGuid():N}";
        payment.Method = request.Method;

        order.Status = OrderStatus.Paid;
        order.PaidAt = now;

        foreach (var item in order.Items)
        {
            var variant = await productRepository.GetVariantAsync(item.VariantId, cancellationToken)
                ?? throw new NotFoundException("Product variant was not found.");
            var inventory = variant.Inventory ?? throw new NotFoundException("Inventory was not found.");
            if (inventory.FrozenStock < item.Quantity)
            {
                throw new BusinessException("Frozen stock is not enough to complete payment.");
            }

            inventory.FrozenStock -= item.Quantity;
            inventory.SoldCount += item.Quantity;
            inventory.Version += 1;
            await inventoryLogRepository.AddAsync(new InventoryLog
            {
                Id = Guid.NewGuid(),
                InventoryId = inventory.Id,
                ChangeType = "Sold",
                Quantity = item.Quantity,
                Reason = $"Order {order.OrderNo} paid",
                OrderId = order.Id,
                CreatedAt = now
            }, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var updatedOrder = await orderRepository.GetByIdAsync(order.Id, cancellationToken)
            ?? throw new NotFoundException("Order was not found.");
        return OrderMapper.ToDto(updatedOrder);
    }
}
