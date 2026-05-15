using MediatR;

namespace FlashShop.Application.Orders.Commands;

public sealed class CancelOrderCommand : IRequest
{
    public Guid OrderId { get; set; }
    public Guid UserId { get; set; }
}

public sealed class CancelOrderCommandHandler : IRequestHandler<CancelOrderCommand>
{
    public Task Handle(CancelOrderCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
