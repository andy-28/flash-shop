using FlashShop.Application.Cart.DTOs;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Cart.Commands;

public sealed class RemoveFromCartCommand : IRequest<CartDto>
{
    public Guid UserId { get; set; }
    public Guid CartItemId { get; set; }
}

public sealed class RemoveFromCartCommandHandler(ICartRepository cartRepository, IUnitOfWork unitOfWork)
    : IRequestHandler<RemoveFromCartCommand, CartDto>
{
    public async Task<CartDto> Handle(RemoveFromCartCommand request, CancellationToken cancellationToken)
    {
        var item = await cartRepository.GetItemAsync(request.UserId, request.CartItemId, cancellationToken)
            ?? throw new NotFoundException("Cart item was not found.");

        cartRepository.RemoveItem(item);
        if (item.Cart is not null)
        {
            item.Cart.UpdatedAt = DateTime.UtcNow;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var cart = await cartRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        return CartMapper.ToDto(cart);
    }
}
