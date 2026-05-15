namespace FlashShop.Application.Cart.DTOs;

public sealed class CartDto
{
    public Guid Id { get; set; }
    public IReadOnlyCollection<CartItemDto> Items { get; set; } = Array.Empty<CartItemDto>();
    public decimal TotalAmount { get; set; }
}

public sealed class CartItemDto
{
    public Guid VariantId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SpecName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
}
