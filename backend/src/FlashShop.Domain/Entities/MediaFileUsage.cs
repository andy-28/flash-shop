namespace FlashShop.Domain.Entities;

public sealed class MediaFileUsage
{
    public Guid Id { get; set; }
    public Guid MediaFileId { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string FieldName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public MediaFile MediaFile { get; set; } = null!;
}
