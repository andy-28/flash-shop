using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Shipments.DTOs;
using FlashShop.Domain.Enums;
using MediatR;

namespace FlashShop.Application.Shipments.Commands;

public sealed class MarkDeliveredCommand : IRequest<ShipmentDto>
{
    public Guid OrderId { get; set; }
}

public sealed class MarkDeliveredCommandHandler(
    IOrderRepository orderRepository,
    IDashboardNotifier dashboardNotifier,
    IUnitOfWork unitOfWork) : IRequestHandler<MarkDeliveredCommand, ShipmentDto>
{
    public async Task<ShipmentDto> Handle(MarkDeliveredCommand request, CancellationToken cancellationToken)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order was not found.");

        OrderStateMachine.ValidateTransition(order.Status, OrderStatus.Delivered);

        var shipment = order.Shipment ?? throw new BusinessException("Order has not been shipped.");
        shipment.Status = ShipmentStatus.Delivered;
        shipment.DeliveredAt = DateTime.UtcNow;
        order.Status = OrderStatus.Delivered;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await dashboardNotifier.NotifyOrderDelivered(order.OrderNo, cancellationToken);

        return ShipmentMapper.ToDto(shipment);
    }
}
