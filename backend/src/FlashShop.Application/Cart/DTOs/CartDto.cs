namespace FlashShop.Application.Cart.DTOs;

public sealed class CartDto
{
    public Guid? Id { get; set; }
    public IReadOnlyCollection<CartItemDto> Items { get; set; } = Array.Empty<CartItemDto>();
    public decimal TotalAmount { get; set; }
    public int ItemCount { get; set; }
}

public sealed class CartItemDto
{
    public Guid CartItemId { get; set; }
    public Guid VariantId { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SpecName { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public int AvailableStock { get; set; }
    public decimal Subtotal { get; set; }
    public bool IsAvailable { get; set; }
}
