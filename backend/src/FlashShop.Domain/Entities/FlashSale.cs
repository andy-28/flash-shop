namespace FlashShop.Domain.Entities;

public sealed class FlashSale
{
    public Guid Id { get; set; }
    public Guid VariantId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal FlashPrice { get; set; }
    public int TotalStock { get; set; }
    public int SoldCount { get; set; }
    public int PerUserLimit { get; set; } = 1;
    public DateTime StartAt { get; set; }
    public DateTime EndAt { get; set; }
    public string Status { get; set; } = "Pending";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ProductVariant Variant { get; set; } = null!;
}
