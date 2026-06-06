using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Infrastructure.Persistence.Repositories;

public sealed class NotificationRepository(AppDbContext dbContext) : INotificationRepository
{
    public async Task<IReadOnlyCollection<Notification>> ListForUserAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        return await dbContext.Notifications
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .Skip((Math.Max(page, 1) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountUnreadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return dbContext.Notifications.CountAsync(x => x.UserId == userId && !x.IsRead, cancellationToken);
    }

    public Task<int> CountForUserAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return dbContext.Notifications.CountAsync(x => x.UserId == userId, cancellationToken);
    }

    public Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return dbContext.Notifications.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public Task AddAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        return dbContext.Notifications.AddAsync(notification, cancellationToken).AsTask();
    }

    public Task MarkAllReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return dbContext.Notifications
            .Where(x => x.UserId == userId && !x.IsRead)
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.IsRead, true), cancellationToken);
    }
}
