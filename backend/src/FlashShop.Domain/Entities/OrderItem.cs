namespace FlashShop.Domain.Entities;

public sealed class OrderItem
{
    public Guid Id { get; set; }
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    public Guid VariantId { get; set; }
    public ProductVariant? Variant { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string SpecName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}
