namespace FlashShop.Domain.Entities;

public sealed class Cart
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public DateTime UpdatedAt { get; set; }
    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}
