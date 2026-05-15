namespace FlashShop.Domain.Entities;

public sealed class Inventory
{
    public Guid Id { get; set; }
    public Guid VariantId { get; set; }
    public ProductVariant? Variant { get; set; }
    public int TotalStock { get; set; }
    public int AvailableStock { get; set; }
    public int FrozenStock { get; set; }
    public int SoldCount { get; set; }
    public int Version { get; set; }
    public ICollection<InventoryLog> Logs { get; set; } = new List<InventoryLog>();
}
