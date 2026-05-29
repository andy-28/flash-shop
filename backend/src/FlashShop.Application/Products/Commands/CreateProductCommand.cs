using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using MediatR;

namespace FlashShop.Application.Products.Commands;

public sealed class CreateProductCommand : IRequest<Guid>
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public IReadOnlyCollection<CreateProductVariantCommand> Variants { get; set; } = Array.Empty<CreateProductVariantCommand>();
}

public sealed class CreateProductVariantCommand
{
    public string Sku { get; set; } = string.Empty;
    public string SpecName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int TotalStock { get; set; }
}

public sealed class CreateProductCommandHandler(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService,
    IMediaRepository mediaRepository)
    : IRequestHandler<CreateProductCommand, Guid>
{
    public async Task<Guid> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        if (!request.Variants.Any())
        {
            throw new BusinessException("Product must have at least one variant.");
        }

        var duplicateSku = request.Variants
            .GroupBy(x => x.Sku.Trim(), StringComparer.OrdinalIgnoreCase)
            .FirstOrDefault(x => x.Count() > 1);
        if (duplicateSku is not null)
        {
            throw new BusinessException($"Duplicate SKU in request: {duplicateSku.Key}");
        }

        var now = DateTime.UtcNow;
        var productId = Guid.NewGuid();
        var product = new Product
        {
            Id = productId,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Category = request.Category.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
            Status = "Active",
            CreatedAt = now,
            UpdatedAt = now,
            Variants = request.Variants.Select(variant =>
            {
                var variantId = Guid.NewGuid();
                return new ProductVariant
                {
                    Id = variantId,
                    Sku = variant.Sku.Trim(),
                    SpecName = variant.SpecName.Trim(),
                    Price = variant.Price,
                    Status = "Active",
                    CreatedAt = now,
                    ProductId = productId,
                    Inventory = new Domain.Entities.Inventory
                    {
                        Id = Guid.NewGuid(),
                        VariantId = variantId,
                        TotalStock = variant.TotalStock,
                        AvailableStock = variant.TotalStock,
                        FrozenStock = 0,
                        SoldCount = 0,
                        Version = 0
                    }
                };
            }).ToList()
        };

        await productRepository.AddAsync(product, cancellationToken);
        if (!string.IsNullOrWhiteSpace(product.ImageUrl))
        {
            await mediaRepository.TrackUsageByPathAsync(product.ImageUrl, "Product", product.Id, "ImageUrl", cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveByPrefixAsync(CacheKeys.ProductListPrefix, cancellationToken);
        return product.Id;
    }
}
