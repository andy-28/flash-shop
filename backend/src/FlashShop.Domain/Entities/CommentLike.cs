namespace FlashShop.Domain.Entities;

public sealed class CommentLike
{
    public Guid Id { get; set; }
    public Guid CommentId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public PostComment Comment { get; set; } = null!;
    public User User { get; set; } = null!;
}
