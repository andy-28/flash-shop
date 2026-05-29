using FlashShop.Domain.Entities;

namespace FlashShop.Application.Common.Interfaces;

public interface IMediaRepository
{
    Task AddAsync(MediaFile mediaFile, CancellationToken cancellationToken = default);
    Task<MediaFile?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<MediaFile?> GetByFilePathAsync(string filePath, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<MediaFile>> ListAsync(string? folder, string? search, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountAsync(string? folder, string? search, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<string>> GetFoldersAsync(CancellationToken cancellationToken = default);
    Task TrackUsageByPathAsync(string filePath, string entityType, Guid entityId, string fieldName, CancellationToken cancellationToken = default);
    Task ClearUsageAsync(string entityType, Guid entityId, string fieldName, CancellationToken cancellationToken = default);
    void Remove(MediaFile mediaFile);
}
