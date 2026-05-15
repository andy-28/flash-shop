using FlashShop.Application.Cart.DTOs;
using MediatR;

namespace FlashShop.Application.Cart.Commands;

public sealed class AddToCartCommand : IRequest<CartDto>
{
    public Guid UserId { get; set; }
    public Guid VariantId { get; set; }
    public int Quantity { get; set; }
}

public sealed class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, CartDto>
{
    public Task<CartDto> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
