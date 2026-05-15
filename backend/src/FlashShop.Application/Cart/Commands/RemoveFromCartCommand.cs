using FlashShop.Application.Cart.DTOs;
using MediatR;

namespace FlashShop.Application.Cart.Commands;

public sealed class RemoveFromCartCommand : IRequest<CartDto>
{
    public Guid UserId { get; set; }
    public Guid VariantId { get; set; }
}

public sealed class RemoveFromCartCommandHandler : IRequestHandler<RemoveFromCartCommand, CartDto>
{
    public Task<CartDto> Handle(RemoveFromCartCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
