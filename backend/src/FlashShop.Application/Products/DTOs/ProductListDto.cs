namespace FlashShop.Application.Products.DTOs;

public sealed class ProductListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public decimal MinPrice { get; set; }
}
