using FlashShop.Application.Cart.DTOs;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Cart.Queries;

public sealed class GetCartQuery : IRequest<CartDto>
{
    public Guid UserId { get; set; }
}

public sealed class GetCartQueryHandler(ICartRepository cartRepository) : IRequestHandler<GetCartQuery, CartDto>
{
    public async Task<CartDto> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        var cart = await cartRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        return CartMapper.ToDto(cart);
    }
}
