using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Orders.DTOs;
using MediatR;

namespace FlashShop.Application.Orders.Queries;

public sealed class GetOrderDetailQuery : IRequest<OrderDto>
{
    public Guid OrderId { get; set; }
    public Guid? UserId { get; set; }
    public bool IsAdmin { get; set; }
}

public sealed class GetOrderDetailQueryHandler(IOrderRepository orderRepository)
    : IRequestHandler<GetOrderDetailQuery, OrderDto>
{
    public async Task<OrderDto> Handle(GetOrderDetailQuery request, CancellationToken cancellationToken)
    {
        var order = await orderRepository.GetByIdAsync(request.OrderId, cancellationToken)
            ?? throw new NotFoundException("Order was not found.");

        if (!request.IsAdmin && order.UserId != request.UserId)
        {
            throw new NotFoundException("Order was not found.");
        }

        return OrderMapper.ToDto(order);
    }
}
