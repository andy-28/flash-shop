namespace FlashShop.Domain.Entities;

public sealed class InventoryLog
{
    public Guid Id { get; set; }
    public Guid InventoryId { get; set; }
    public Inventory? Inventory { get; set; }
    public string ChangeType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public string Reason { get; set; } = string.Empty;
    public Guid? OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}
