using FlashShop.Domain.Entities;

namespace FlashShop.Application.Common.Interfaces;

public interface INotificationRepository
{
    Task<IReadOnlyCollection<Notification>> ListForUserAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountForUserAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> CountUnreadAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task AddAsync(Notification notification, CancellationToken cancellationToken = default);
    Task MarkAllReadAsync(Guid userId, CancellationToken cancellationToken = default);
}
