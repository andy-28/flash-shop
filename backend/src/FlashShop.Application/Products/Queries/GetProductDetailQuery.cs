using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Products.DTOs;
using MediatR;

namespace FlashShop.Application.Products.Queries;

public sealed class GetProductDetailQuery : IRequest<ProductDetailDto>
{
    public Guid Id { get; set; }
}

public sealed class GetProductDetailQueryHandler(
    IProductRepository productRepository,
    ICacheService cacheService,
    ICacheStatusService cacheStatusService)
    : IRequestHandler<GetProductDetailQuery, ProductDetailDto>
{
    public async Task<ProductDetailDto> Handle(GetProductDetailQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = CacheKeys.ProductDetail(request.Id);
        var cached = await cacheService.GetAsync<ProductDetailDto>(cacheKey, cancellationToken);
        if (cached is not null)
        {
            cacheStatusService.SetHit();
            return cached;
        }

        var product = await productRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Product was not found.");

        var result = new ProductDetailDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Category = product.Category,
            ImageUrl = product.ImageUrl,
            Status = product.Status,
            Variants = product.Variants.Select(variant => new ProductVariantDto
            {
                Id = variant.Id,
                Sku = variant.Sku,
                SpecName = variant.SpecName,
                Price = variant.Price,
                AvailableStock = variant.Inventory?.AvailableStock ?? 0
            }).ToList()
        };

        await cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5), cancellationToken);
        cacheStatusService.SetMiss();
        return result;
    }
}
