using FlashShop.Domain.Entities;

namespace FlashShop.Infrastructure.Persistence.Repositories;

public sealed class OrderRepository
{
    private readonly AppDbContext _dbContext;

    public OrderRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public IQueryable<Order> Query() => _dbContext.Orders;
}
