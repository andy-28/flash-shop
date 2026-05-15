using FlashShop.Application.Orders.DTOs;
using MediatR;

namespace FlashShop.Application.Orders.Commands;

public sealed class ProcessPaymentCommand : IRequest<OrderDto>
{
    public Guid OrderId { get; set; }
    public string Method { get; set; } = "Mock";
}

public sealed class ProcessPaymentCommandHandler : IRequestHandler<ProcessPaymentCommand, OrderDto>
{
    public Task<OrderDto> Handle(ProcessPaymentCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
