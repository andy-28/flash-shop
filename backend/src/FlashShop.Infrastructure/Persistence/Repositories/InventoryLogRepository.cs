using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;

namespace FlashShop.Infrastructure.Persistence.Repositories;

public sealed class InventoryLogRepository(AppDbContext dbContext) : IInventoryLogRepository
{
    public Task AddAsync(InventoryLog log, CancellationToken cancellationToken = default)
    {
        return dbContext.InventoryLogs.AddAsync(log, cancellationToken).AsTask();
    }
}
