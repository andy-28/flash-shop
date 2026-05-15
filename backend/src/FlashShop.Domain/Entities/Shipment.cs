using FlashShop.Domain.Enums;

namespace FlashShop.Domain.Entities;

public sealed class Shipment
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    public string Carrier { get; set; } = string.Empty;
    public string? TrackingNo { get; set; }
    public ShipmentStatus Status { get; set; } = ShipmentStatus.Pending;
    public DateTime? ShippedAt { get; set; }
    public DateTime? DeliveredAt { get; set; }
}
