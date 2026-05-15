using FlashShop.Application.Products.DTOs;
using MediatR;

namespace FlashShop.Application.Products.Queries;

public sealed class GetProductDetailQuery : IRequest<ProductDetailDto>
{
    public Guid Id { get; set; }
}

public sealed class GetProductDetailQueryHandler : IRequestHandler<GetProductDetailQuery, ProductDetailDto>
{
    public Task<ProductDetailDto> Handle(GetProductDetailQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
