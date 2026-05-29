namespace FlashShop.Domain.Entities;

public sealed class ContentVersion
{
    public Guid Id { get; set; }
    public Guid ContentBlockId { get; set; }
    public int VersionNumber { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string? Body { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string LinkType { get; set; } = "None";
    public string Placement { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime? StartAt { get; set; }
    public DateTime? EndAt { get; set; }
    public Guid ModifiedBy { get; set; }
    public string ChangeNote { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ContentBlock ContentBlock { get; set; } = null!;
    public User ModifiedByUser { get; set; } = null!;
}
