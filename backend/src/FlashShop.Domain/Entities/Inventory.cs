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

    /// <summary>凍結庫存：available → frozen（下單時）</summary>
    public void Freeze(int quantity)
    {
        if (quantity <= 0)
            throw new InvalidOperationException("凍結數量必須大於 0");
        if (AvailableStock < quantity)
            throw new InvalidOperationException($"庫存不足（可用 {AvailableStock}，需要 {quantity}）");
        AvailableStock -= quantity;
        FrozenStock += quantity;
    }

    /// <summary>釋放庫存：frozen → available（取消/超時）</summary>
    public void Release(int quantity)
    {
        if (quantity <= 0)
            throw new InvalidOperationException("釋放數量必須大於 0");
        if (FrozenStock < quantity)
            throw new InvalidOperationException($"凍結庫存不足（凍結 {FrozenStock}，要釋放 {quantity}）");
        FrozenStock -= quantity;
        AvailableStock += quantity;
    }

    /// <summary>成交庫存：frozen → sold（付款成功）</summary>
    public void Commit(int quantity)
    {
        if (quantity <= 0)
            throw new InvalidOperationException("成交數量必須大於 0");
        if (FrozenStock < quantity)
            throw new InvalidOperationException($"凍結庫存不足（凍結 {FrozenStock}，要成交 {quantity}）");
        FrozenStock -= quantity;
        SoldCount += quantity;
    }

    /// <summary>補充庫存：available += n（預購到貨/進貨）</summary>
    public void Restock(int quantity)
    {
        if (quantity <= 0)
            throw new InvalidOperationException("補貨數量必須大於 0");
        AvailableStock += quantity;
        TotalStock += quantity;
    }
}
