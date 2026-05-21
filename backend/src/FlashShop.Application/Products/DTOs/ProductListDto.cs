namespace FlashShop.Application.Products.DTOs;

public sealed class ProductListDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal MinPrice { get; set; }
    public int AvailableStock { get; set; }
    public IReadOnlyCollection<ProductVariantDto> Variants { get; set; } = Array.Empty<ProductVariantDto>();
}
