namespace FlashShop.Application.Inventory.DTOs;

public sealed class InventoryDto
{
    public Guid VariantId { get; set; }
    public int TotalStock { get; set; }
    public int AvailableStock { get; set; }
    public int FrozenStock { get; set; }
    public int SoldCount { get; set; }
    public int Version { get; set; }
}
