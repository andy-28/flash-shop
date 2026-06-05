using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Shipments.DTOs;
using FlashShop.Domain.Enums;
using MediatR;

namespace FlashShop.Application.Shipments.Commands;

public sealed class UpdateTrackingCommand : IRequest<ShipmentDto>
{
    public Guid OrderId { get; set; }
    public string? TrackingNo { get; set; }
}

public sealed class UpdateTrackingCommandHandler(
    IOrderRepository orderRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateTrackingCommand, ShipmentDto>
{
    public async Task<ShipmentDto> Handle(UpdateTrackingCommand request, CancellationToken cancellationToken)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order was not found.");

        if (order.Status != OrderStatus.Shipping)
        {
            throw new BusinessException("Tracking can only be updated for shipping orders.");
        }

        var shipment = order.Shipment ?? throw new BusinessException("Order has not been shipped.");
        shipment.TrackingNo = string.IsNullOrWhiteSpace(request.TrackingNo) ? null : request.TrackingNo.Trim();

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return ShipmentMapper.ToDto(shipment);
    }
}
