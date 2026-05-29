namespace FlashShop.Application.Products.DTOs;

public sealed class ProductDetailDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string Status { get; set; } = string.Empty;
    public IReadOnlyCollection<ProductVariantDto> Variants { get; set; } = Array.Empty<ProductVariantDto>();
}

public sealed class ProductVariantDto
{
    public Guid Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string SpecName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int AvailableStock { get; set; }
}
