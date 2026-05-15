using FlashShop.Application.Orders.DTOs;
using MediatR;

namespace FlashShop.Application.Orders.Commands;

public sealed class CreateOrderCommand : IRequest<OrderDto>
{
    public Guid UserId { get; set; }
    public IReadOnlyCollection<CreateOrderItemRequest> Items { get; set; } = Array.Empty<CreateOrderItemRequest>();
    public string? CouponCode { get; set; }
}

public sealed class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, OrderDto>
{
    public Task<OrderDto> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
