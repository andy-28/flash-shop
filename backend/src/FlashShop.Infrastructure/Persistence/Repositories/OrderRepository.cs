using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Infrastructure.Persistence.Repositories;

public sealed class OrderRepository(AppDbContext dbContext) : IOrderRepository
{
    public Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return IncludeDetails(dbContext.Orders)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Order>> ListForUserAsync(
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        return await IncludeDetails(dbContext.Orders)
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Skip((Math.Max(page, 1) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<Order>> ListForAdminAsync(
        OrderStatus? status,
        DateTime? from,
        DateTime? to,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        var query = IncludeDetails(dbContext.Orders).AsNoTracking().AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == status.Value);
        }

        if (from.HasValue)
        {
            query = query.Where(x => x.CreatedAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(x => x.CreatedAt <= to.Value);
        }

        return await query
            .OrderByDescending(x => x.CreatedAt)
            .Skip((Math.Max(page, 1) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .ToListAsync(cancellationToken);
    }

    public Task<string?> GetLastOrderNoForDateAsync(DateTime dateUtc, CancellationToken cancellationToken = default)
    {
        var prefix = $"ORD-{dateUtc:yyyyMMdd}-";
        return dbContext.Orders
            .AsNoTracking()
            .Where(x => x.OrderNo.StartsWith(prefix))
            .OrderByDescending(x => x.OrderNo)
            .Select(x => x.OrderNo)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public Task AddAsync(Order order, CancellationToken cancellationToken = default)
    {
        return dbContext.Orders.AddAsync(order, cancellationToken).AsTask();
    }

    private static IQueryable<Order> IncludeDetails(IQueryable<Order> query)
    {
        return query
            .Include(x => x.User)
            .Include(x => x.Items)
            .Include(x => x.Payment)
            .Include(x => x.Shipment);
    }
}
