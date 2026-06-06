using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using MediatR;

namespace FlashShop.Application.Products.Commands;

public sealed class UpdateProductCommand : IRequest
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string Status { get; set; } = "Active";
    public IReadOnlyCollection<UpdateProductVariantCommand> Variants { get; set; } = Array.Empty<UpdateProductVariantCommand>();
}

public sealed class UpdateProductVariantCommand
{
    public Guid? Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string SpecName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Status { get; set; } = "Active";
    public int? TotalStock { get; set; }
    public bool IsPreOrder { get; set; }
    public DateTime? EstimatedArrivalDate { get; set; }
}

public sealed class UpdateProductCommandHandler(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService,
    IMediaRepository mediaRepository)
    : IRequestHandler<UpdateProductCommand>
{
    public async Task Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Product was not found.");

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
        product.Name = request.Name.Trim();
        product.Description = request.Description.Trim();
        product.Category = request.Category.Trim();
        product.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim();
        product.Status = request.Status.Trim();
        product.UpdatedAt = now;

        foreach (var variantRequest in request.Variants)
        {
            var variant = variantRequest.Id.HasValue
                ? product.Variants.FirstOrDefault(x => x.Id == variantRequest.Id.Value)
                : null;

            if (variant is null)
            {
                var variantId = Guid.NewGuid();
                product.Variants.Add(new ProductVariant
                {
                    Id = variantId,
                    ProductId = product.Id,
                    Sku = variantRequest.Sku.Trim(),
                    SpecName = variantRequest.SpecName.Trim(),
                    Price = variantRequest.Price,
                    Status = variantRequest.Status.Trim(),
                    IsPreOrder = variantRequest.IsPreOrder,
                    EstimatedArrivalDate = variantRequest.IsPreOrder ? variantRequest.EstimatedArrivalDate : null,
                    PreOrderCount = 0,
                    CreatedAt = now,
                    Inventory = new Domain.Entities.Inventory
                    {
                        Id = Guid.NewGuid(),
                        VariantId = variantId,
                        TotalStock = variantRequest.TotalStock ?? 0,
                        AvailableStock = variantRequest.TotalStock ?? 0,
                        FrozenStock = 0,
                        SoldCount = 0,
                        Version = 0
                    }
                });
                continue;
            }

            variant.Sku = variantRequest.Sku.Trim();
            variant.SpecName = variantRequest.SpecName.Trim();
            variant.Price = variantRequest.Price;
            variant.Status = variantRequest.Status.Trim();
            variant.IsPreOrder = variantRequest.IsPreOrder;
            variant.EstimatedArrivalDate = variantRequest.IsPreOrder ? variantRequest.EstimatedArrivalDate : null;

            if (variantRequest.TotalStock.HasValue && variant.Inventory is not null)
            {
                var totalStock = variantRequest.TotalStock.Value;
                if (totalStock < variant.Inventory.FrozenStock + variant.Inventory.SoldCount)
                {
                    throw new BusinessException("Total stock cannot be lower than frozen plus sold stock.");
                }

                variant.Inventory.TotalStock = totalStock;
                variant.Inventory.AvailableStock = totalStock - variant.Inventory.FrozenStock - variant.Inventory.SoldCount;
                variant.Inventory.Version += 1;
            }
        }

        await mediaRepository.ClearUsageAsync("Product", product.Id, "ImageUrl", cancellationToken);
        if (!string.IsNullOrWhiteSpace(product.ImageUrl))
        {
            await mediaRepository.TrackUsageByPathAsync(product.ImageUrl, "Product", product.Id, "ImageUrl", cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveByPrefixAsync(CacheKeys.ProductListPrefix, cancellationToken);
        await cacheService.RemoveAsync(CacheKeys.ProductDetail(product.Id), cancellationToken);
    }
}
