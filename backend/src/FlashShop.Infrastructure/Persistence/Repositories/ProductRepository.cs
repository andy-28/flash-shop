using FlashShop.Domain.Entities;

namespace FlashShop.Infrastructure.Persistence.Repositories;

public sealed class ProductRepository
{
    private readonly AppDbContext _dbContext;

    public ProductRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IQueryable<Product> Query() => _dbContext.Products;
}
