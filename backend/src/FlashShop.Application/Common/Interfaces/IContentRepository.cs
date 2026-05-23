using FlashShop.Domain.Entities;

namespace FlashShop.Application.Common.Interfaces;

public interface IContentRepository
{
    Task<int> GetNextPositionAsync(string placement, CancellationToken cancellationToken = default);
    Task<ContentBlock?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ContentBlock>> ListPublicByPlacementAsync(string placement, DateTime now, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ContentBlock>> ListAdminAsync(string? placement, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ContentBlock>> ListByPlacementAsync(string placement, CancellationToken cancellationToken = default);
    Task AddAsync(ContentBlock block, CancellationToken cancellationToken = default);
    void Remove(ContentBlock block);
}
