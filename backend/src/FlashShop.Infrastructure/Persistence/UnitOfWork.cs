using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Infrastructure.Persistence;

public sealed class UnitOfWork(AppDbContext dbContext) : IUnitOfWork
{
    public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            return await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ConcurrencyException("Inventory changed while processing the order. Please try again.");
        }
    }
}
