using FlashShop.Application.Products.DTOs;
using MediatR;

namespace FlashShop.Application.Products.Queries;

public sealed class GetProductListQuery : IRequest<IReadOnlyCollection<ProductListDto>>
{
    public string? Category { get; set; }
}

public sealed class GetProductListQueryHandler : IRequestHandler<GetProductListQuery, IReadOnlyCollection<ProductListDto>>
{
    public Task<IReadOnlyCollection<ProductListDto>> Handle(GetProductListQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
