namespace FlashShop.Application.Orders.DTOs;

public sealed class CreateOrderRequest
{
    public IReadOnlyCollection<CreateOrderItemRequest> Items { get; set; } = Array.Empty<CreateOrderItemRequest>();
    public string? CouponCode { get; set; }
}

public sealed class CreateOrderItemRequest
{
    public Guid VariantId { get; set; }
    public int Quantity { get; set; }
}
