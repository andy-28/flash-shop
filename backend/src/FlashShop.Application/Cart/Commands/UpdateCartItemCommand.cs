using FlashShop.Application.Cart.DTOs;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Cart.Commands;

public sealed class UpdateCartItemCommand : IRequest<CartDto>
{
    public Guid UserId { get; set; }
    public Guid CartItemId { get; set; }
    public int Quantity { get; set; }
}

public sealed class UpdateCartItemCommandHandler(ICartRepository cartRepository, IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateCartItemCommand, CartDto>
{
    public async Task<CartDto> Handle(UpdateCartItemCommand request, CancellationToken cancellationToken)
    {
        if (request.Quantity <= 0)
        {
            throw new BusinessException("Quantity must be greater than zero.");
        }

        var item = await cartRepository.GetItemAsync(request.UserId, request.CartItemId, cancellationToken)
            ?? throw new NotFoundException("Cart item was not found.");

        var availableStock = item.Variant?.Inventory?.AvailableStock ?? 0;
        if (request.Quantity > availableStock)
        {
            throw new BusinessException("Insufficient stock.");
        }

        item.Quantity = request.Quantity;
        if (item.Cart is not null)
        {
            item.Cart.UpdatedAt = DateTime.UtcNow;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var cart = await cartRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        return CartMapper.ToDto(cart);
    }
}
