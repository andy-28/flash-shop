using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Products.DTOs;
using MediatR;

namespace FlashShop.Application.Products.Queries;

public sealed class GetProductDetailQuery : IRequest<ProductDetailDto>
{
    public Guid Id { get; set; }
}

public sealed class GetProductDetailQueryHandler(IProductRepository productRepository)
    : IRequestHandler<GetProductDetailQuery, ProductDetailDto>
{
    public async Task<ProductDetailDto> Handle(GetProductDetailQuery request, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Product was not found.");

        return new ProductDetailDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Category = product.Category,
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
    }
}
