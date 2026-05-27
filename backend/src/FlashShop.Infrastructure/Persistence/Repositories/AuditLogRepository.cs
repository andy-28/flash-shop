using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;

namespace FlashShop.Infrastructure.Persistence.Repositories;

public sealed class AuditLogRepository(AppDbContext dbContext) : IAuditLogRepository
{
    public async Task AddAsync(AuditLog log, CancellationToken cancellationToken = default)
    {
        await dbContext.AuditLogs.AddAsync(log, cancellationToken);
    }
}
