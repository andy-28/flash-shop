namespace FlashShop.Domain.Entities;

public sealed class CartItem
{
    public Guid Id { get; set; }
    public Guid CartId { get; set; }
    public Cart? Cart { get; set; }
    public Guid VariantId { get; set; }
    public ProductVariant? Variant { get; set; }
    public int Quantity { get; set; }
    public DateTime AddedAt { get; set; }
}
