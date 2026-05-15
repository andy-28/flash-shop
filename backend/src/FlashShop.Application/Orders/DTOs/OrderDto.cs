using FlashShop.Domain.Enums;

namespace FlashShop.Application.Orders.DTOs;

public sealed class OrderDto
{
    public Guid Id { get; set; }
    public string OrderNo { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public decimal FinalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiredAt { get; set; }
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
