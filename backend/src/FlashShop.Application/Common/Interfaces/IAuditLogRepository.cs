namespace FlashShop.Application.Common.Interfaces;

public interface IAuditLogRepository
{
    Task AddAsync(FlashShop.Domain.Entities.AuditLog log, CancellationToken cancellationToken = default);
}
