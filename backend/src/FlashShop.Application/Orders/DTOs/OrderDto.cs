using FlashShop.Domain.Enums;
using FlashShop.Application.Shipments.DTOs;

namespace FlashShop.Application.Orders.DTOs;

public sealed class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNo { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public string? CouponCode { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal FinalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime ExpiredAt { get; set; }
    public int ItemCount { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public PaymentDto? Payment { get; set; }
    public ShipmentDto? Shipment { get; set; }
    public IReadOnlyCollection<OrderItemDto> Items { get; set; } = Array.Empty<OrderItemDto>();
}

public sealed class OrderItemDto
{
    public string ProductName { get; set; } = string.Empty;
    public string SpecName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}

public sealed class PaymentDto
{
    public string Method { get; set; } = string.Empty;
    public PaymentStatus Status { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? TransactionId { get; set; }
}
