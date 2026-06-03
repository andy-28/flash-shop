namespace FlashShop.Domain.Entities;

public sealed class ContentBlock
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string LinkType { get; set; } = "None";
    public string Placement { get; set; } = string.Empty;
    public string Status { get; set; } = "Draft";
    public string? Body { get; set; }
    public string? Slug { get; set; }
    public string? Category { get; set; }
    public string? VideoUrl { get; set; }
    public string? Summary { get; set; }
    public int ViewCount { get; set; }
    public int Position { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? StartAt { get; set; }
    public DateTime? EndAt { get; set; }
    public DateTime? PublishedAt { get; set; }
    public int Version { get; set; } = 1;
    public Guid CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User CreatedByUser { get; set; } = null!;
    public ICollection<ContentBlockMedia> Media { get; set; } = new List<ContentBlockMedia>();
    public ICollection<ContentVersion> Versions { get; set; } = new List<ContentVersion>();
}
