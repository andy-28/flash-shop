namespace FlashShop.Application.Common.Interfaces;

public interface ICartRepository
{
    Task<Domain.Entities.Cart?> GetByUserIdAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Domain.Entities.CartItem?> GetItemAsync(Guid userId, Guid cartItemId, CancellationToken cancellationToken = default);
    Task AddAsync(Domain.Entities.Cart cart, CancellationToken cancellationToken = default);
    Task AddItemAsync(Domain.Entities.CartItem cartItem, CancellationToken cancellationToken = default);
    void RemoveItem(Domain.Entities.CartItem cartItem);
}
