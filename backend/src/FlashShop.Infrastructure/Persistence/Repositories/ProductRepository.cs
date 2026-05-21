using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Infrastructure.Persistence.Repositories;

public sealed class ProductRepository(AppDbContext dbContext) : IProductRepository
{
    public async Task<IReadOnlyCollection<Product>> ListAsync(
        string? category,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.Products
            .Include(x => x.Variants)
            .ThenInclude(x => x.Inventory)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(x => x.Category == category);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(x => x.Name.Contains(search) || x.Description.Contains(search));
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((Math.Max(page, 1) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .ToListAsync(cancellationToken);
    }

    public Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return dbContext.Products
            .Include(x => x.Variants)
            .ThenInclude(x => x.Inventory)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task<ProductVariant?> GetVariantAsync(Guid variantId, CancellationToken cancellationToken = default)
    {
        return dbContext.ProductVariants
            .Include(x => x.Inventory)
            .Include(x => x.Product)
            .FirstOrDefaultAsync(x => x.Id == variantId, cancellationToken);
    }

    public Task AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        return dbContext.Products.AddAsync(product, cancellationToken).AsTask();
    }
}
