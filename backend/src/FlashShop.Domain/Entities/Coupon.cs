namespace FlashShop.Domain.Entities;

public sealed class Coupon
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "Fixed";
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int UsageLimit { get; set; }
    public int UsedCount { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
