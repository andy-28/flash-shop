using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Cart.DTOs;
using FlashShop.Domain.Entities;
using MediatR;

namespace FlashShop.Application.Cart.Commands;

public sealed class AddToCartCommand : IRequest<CartDto>
{
    public Guid UserId { get; set; }
    public Guid VariantId { get; set; }
    public int Quantity { get; set; }
}

public sealed class AddToCartCommandHandler(
    ICartRepository cartRepository,
    IProductRepository productRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<AddToCartCommand, CartDto>
{
    public async Task<CartDto> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        if (request.Quantity <= 0)
        {
            throw new BusinessException("Quantity must be greater than zero.");
        }

        var variant = await productRepository.GetVariantAsync(request.VariantId, cancellationToken)
            ?? throw new NotFoundException("Product variant was not found.");

        if (variant.Status != "Active" || variant.Product?.Status != "Active")
        {
            throw new BusinessException("Product variant is not available.");
        }

        if (variant.IsPreOrder)
        {
            throw new BusinessException("預購商品請使用預購功能。");
        }

        var inventory = variant.Inventory ?? throw new NotFoundException("Inventory was not found.");
        var cart = await cartRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        if (cart is null)
        {
            cart = new Domain.Entities.Cart
            {
                Id = Guid.NewGuid(),
                UserId = request.UserId,
                UpdatedAt = DateTime.UtcNow
            };
            await cartRepository.AddAsync(cart, cancellationToken);
        }

        var item = cart.Items.FirstOrDefault(x => x.VariantId == request.VariantId);
        var nextQuantity = (item?.Quantity ?? 0) + request.Quantity;
        if (nextQuantity > inventory.AvailableStock)
        {
            throw new BusinessException("Insufficient stock.");
        }

        if (item is null)
        {
            await cartRepository.AddItemAsync(new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                VariantId = request.VariantId,
                Quantity = request.Quantity,
                AddedAt = DateTime.UtcNow,
                Variant = variant
            }, cancellationToken);
        }
        else
        {
            item.Quantity = nextQuantity;
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await unitOfWork.SaveChangesAsync(cancellationToken);

        cart = await cartRepository.GetByUserIdAsync(request.UserId, cancellationToken);
        return CartMapper.ToDto(cart);
    }
}
