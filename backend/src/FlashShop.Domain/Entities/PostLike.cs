namespace FlashShop.Domain.Entities;

public sealed class PostLike
{
    public Guid Id { get; set; }
    public Guid PostId { get; set; }
    public Guid UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public CommunityPost Post { get; set; } = null!;
    public User User { get; set; } = null!;
}
