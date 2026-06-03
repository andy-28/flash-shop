namespace FlashShop.Domain.Entities;

public sealed class CommunityPost
{
    public Guid Id { get; set; }
    public Guid AuthorId { get; set; }
    public string Category { get; set; } = "General";
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public bool IsPinned { get; set; }
    public bool IsHidden { get; set; }
    public int LikeCount { get; set; }
    public int CommentCount { get; set; }
    public int ViewCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User Author { get; set; } = null!;
    public ICollection<PostComment> Comments { get; set; } = new List<PostComment>();
    public ICollection<PostLike> Likes { get; set; } = new List<PostLike>();
}
