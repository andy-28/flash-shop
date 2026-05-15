using FlashShop.Application.Orders.DTOs;
using MediatR;

namespace FlashShop.Application.Orders.Queries;

public sealed class GetOrderListQuery : IRequest<IReadOnlyCollection<OrderDto>>
{
    public Guid UserId { get; set; }
}

public sealed class GetOrderListQueryHandler : IRequestHandler<GetOrderListQuery, IReadOnlyCollection<OrderDto>>
{
    public Task<IReadOnlyCollection<OrderDto>> Handle(GetOrderListQuery request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
