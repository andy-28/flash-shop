using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Orders.DTOs;
using FlashShop.Domain.Enums;
using MediatR;

namespace FlashShop.Application.Orders.Queries;

public sealed class GetOrderListQuery : IRequest<IReadOnlyCollection<OrderDto>>
{
    public Guid? UserId { get; set; }
    public bool IsAdmin { get; set; }
    public OrderStatus? Status { get; set; }
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public sealed class GetOrderListQueryHandler(IOrderRepository orderRepository)
    : IRequestHandler<GetOrderListQuery, IReadOnlyCollection<OrderDto>>
{
    public async Task<IReadOnlyCollection<OrderDto>> Handle(GetOrderListQuery request, CancellationToken cancellationToken)
    {
        var orders = request.IsAdmin
            ? await orderRepository.ListForAdminAsync(request.Status, request.From, request.To, request.Page, request.PageSize, cancellationToken)
            : await orderRepository.ListForUserAsync(
                request.UserId ?? throw new BusinessException("User is required."),
                request.Page,
                request.PageSize,
                cancellationToken);

        return orders.Select(OrderMapper.ToDto).ToArray();
    }
}
