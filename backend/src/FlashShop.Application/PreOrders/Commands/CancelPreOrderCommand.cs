using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Orders.DTOs;
using FlashShop.Domain.Enums;
using MediatR;

namespace FlashShop.Application.PreOrders.Commands;

public sealed class CancelPreOrderCommand : IRequest<OrderDto>
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
}

public sealed class CancelPreOrderCommandHandler(
    IOrderRepository orderRepository,
    IProductRepository productRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CancelPreOrderCommand, OrderDto>
{
    public async Task<OrderDto> Handle(CancelPreOrderCommand request, CancellationToken cancellationToken)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order was not found.");
        if (order.UserId != request.UserId || order.OrderType != "PreOrder")
        {
            throw new NotFoundException("Order was not found.");
        }

        OrderStateMachine.ValidateTransition(order.Status, OrderStatus.Cancelled);
        order.Status = OrderStatus.Cancelled;
        if (order.Payment is not null)
        {
            order.Payment.Status = PaymentStatus.Failed;
        }

        foreach (var item in order.Items)
        {
            var variant = await productRepository.GetVariantAsync(item.VariantId, cancellationToken)
                ?? throw new NotFoundException("Product variant was not found.");
            variant.PreOrderCount = Math.Max(variant.PreOrderCount - item.Quantity, 0);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        var updatedOrder = await orderRepository.GetByIdAsync(order.Id, cancellationToken)
            ?? throw new NotFoundException("Order was not found.");
        return OrderMapper.ToDto(updatedOrder);
    }
}
