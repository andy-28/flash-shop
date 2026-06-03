namespace FlashShop.Domain.Entities;

public sealed class PostComment
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public Guid AuthorId { get; set; }
    public Guid? ParentCommentId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsHidden { get; set; }
    public int LikeCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public CommunityPost Post { get; set; } = null!;
    public User Author { get; set; } = null!;
    public PostComment? ParentComment { get; set; }
    public ICollection<PostComment> Replies { get; set; } = new List<PostComment>();
    public ICollection<CommentLike> Likes { get; set; } = new List<CommentLike>();
}
