namespace FlashShop.Domain.Entities;

public sealed class ContentBlockMedia
{
    public Guid Id { get; set; }
    public Guid ContentBlockId { get; set; }
    public string MediaType { get; set; } = "Image";
    public string MediaUrl { get; set; } = string.Empty;
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ContentBlock ContentBlock { get; set; } = null!;
}
