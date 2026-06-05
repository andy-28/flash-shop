using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Shipments.DTOs;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using MediatR;

namespace FlashShop.Application.Shipments.Commands;

public sealed class CreateShipmentCommand : IRequest<ShipmentDto>
{
    public Guid OrderId { get; set; }
    public string Carrier { get; set; } = string.Empty;
    public string? TrackingNo { get; set; }
}

public sealed class CreateShipmentCommandHandler(
    IOrderRepository orderRepository,
    IDashboardNotifier dashboardNotifier,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateShipmentCommand, ShipmentDto>
{
    public async Task<ShipmentDto> Handle(CreateShipmentCommand request, CancellationToken cancellationToken)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order was not found.");

        OrderStateMachine.ValidateTransition(order.Status, OrderStatus.Shipping);

        if (order.Shipment is not null)
        {
            throw new BusinessException("Shipment already exists.");
        }

        if (string.IsNullOrWhiteSpace(request.Carrier))
        {
            throw new BusinessException("Carrier is required.");
        }

        var now = DateTime.UtcNow;
        var shipment = new Shipment
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            Carrier = request.Carrier.Trim(),
            TrackingNo = string.IsNullOrWhiteSpace(request.TrackingNo) ? null : request.TrackingNo.Trim(),
            Status = ShipmentStatus.Shipped,
            ShippedAt = now
        };

        order.Shipment = shipment;
        order.Status = OrderStatus.Shipping;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await dashboardNotifier.NotifyOrderShipped(order.OrderNo, cancellationToken);

        return ShipmentMapper.ToDto(shipment);
    }
}
