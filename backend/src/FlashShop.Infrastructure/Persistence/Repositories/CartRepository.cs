using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Infrastructure.Persistence.Repositories;

public sealed class CartRepository(AppDbContext dbContext) : ICartRepository
{
    public Task<Cart?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return dbContext.Carts
            .Include(x => x.Items)
            .ThenInclude(x => x.Variant)
            .ThenInclude(x => x!.Product)
            .Include(x => x.Items)
            .ThenInclude(x => x.Variant)
            .ThenInclude(x => x!.Inventory)
            .FirstOrDefaultAsync(x => x.UserId == userId, cancellationToken);
    }

    public Task<CartItem?> GetItemAsync(Guid userId, Guid cartItemId, CancellationToken cancellationToken = default)
    {
        return dbContext.CartItems
            .Include(x => x.Cart)
            .Include(x => x.Variant)
            .ThenInclude(x => x!.Product)
            .Include(x => x.Variant)
            .ThenInclude(x => x!.Inventory)
            .FirstOrDefaultAsync(x => x.Id == cartItemId && x.Cart != null && x.Cart.UserId == userId, cancellationToken);
    }

    public Task AddAsync(Cart cart, CancellationToken cancellationToken = default)
    {
        return dbContext.Carts.AddAsync(cart, cancellationToken).AsTask();
    }

    public Task AddItemAsync(CartItem cartItem, CancellationToken cancellationToken = default)
    {
        return dbContext.CartItems.AddAsync(cartItem, cancellationToken).AsTask();
    }

    public void RemoveItem(CartItem cartItem)
    {
        dbContext.CartItems.Remove(cartItem);
    }
}
