using FlashShop.Domain.Entities;

namespace FlashShop.Application.Common.Interfaces;

public interface IProductRepository
{
    Task<IReadOnlyCollection<Product>> ListAsync(
        string? category,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default);

    Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<ProductVariant?> GetVariantAsync(Guid variantId, CancellationToken cancellationToken = default);
    Task AddAsync(Product product, CancellationToken cancellationToken = default);
}
