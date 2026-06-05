using FlashShop.Domain.Entities;

namespace FlashShop.Application.Shipments.DTOs;

public sealed record ShipmentDto(
    Guid Id,
    Guid OrderId,
    string Carrier,
    string? TrackingNo,
    string Status,
    DateTime? ShippedAt,
    DateTime? DeliveredAt);

public static class ShipmentMapper
{
    public static ShipmentDto ToDto(Shipment shipment)
    {
        return new ShipmentDto(
            shipment.Id,
            shipment.OrderId,
            shipment.Carrier,
            shipment.TrackingNo,
            shipment.Status.ToString(),
            shipment.ShippedAt,
            shipment.DeliveredAt);
    }
}
