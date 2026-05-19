using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Products.DTOs;
using MediatR;

namespace FlashShop.Application.Products.Queries;

public sealed class GetProductListQuery : IRequest<IReadOnlyCollection<ProductListDto>>
{
    public string? Category { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 24;
}

public sealed class GetProductListQueryHandler(IProductRepository productRepository)
    : IRequestHandler<GetProductListQuery, IReadOnlyCollection<ProductListDto>>
{
    public async Task<IReadOnlyCollection<ProductListDto>> Handle(GetProductListQuery request, CancellationToken cancellationToken)
    {
        var products = await productRepository.ListAsync(
            request.Category,
            request.Search,
            request.Page,
            request.PageSize,
            cancellationToken);

        return products.Select(product => new ProductListDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Category = product.Category,
            Status = product.Status,
            MinPrice = product.Variants.Count == 0 ? 0 : product.Variants.Min(x => x.Price),
            AvailableStock = product.Variants.Sum(x => x.Inventory?.AvailableStock ?? 0),
            Variants = product.Variants.Select(variant => new ProductVariantDto
            {
                Id = variant.Id,
                Sku = variant.Sku,
                SpecName = variant.SpecName,
                Price = variant.Price,
                AvailableStock = variant.Inventory?.AvailableStock ?? 0
            }).ToList()
        }).ToList();
    }
}
