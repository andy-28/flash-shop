using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Infrastructure.Persistence.Repositories;

public sealed class MediaRepository(AppDbContext dbContext) : IMediaRepository
{
    public Task AddAsync(MediaFile mediaFile, CancellationToken cancellationToken = default)
    {
        return dbContext.MediaFiles.AddAsync(mediaFile, cancellationToken).AsTask();
    }

    public Task<MediaFile?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return dbContext.MediaFiles
            .Include(media => media.UploadedByUser)
            .Include(media => media.Usages)
            .FirstOrDefaultAsync(media => media.Id == id, cancellationToken);
    }

    public Task<MediaFile?> GetByFilePathAsync(string filePath, CancellationToken cancellationToken = default)
    {
        return dbContext.MediaFiles
            .Include(media => media.UploadedByUser)
            .Include(media => media.Usages)
            .FirstOrDefaultAsync(media => media.FilePath == filePath, cancellationToken);
    }

    public async Task<IReadOnlyCollection<MediaFile>> ListAsync(
        string? folder,
        string? search,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default)
    {
        return await ApplyFilters(folder, search)
            .Include(media => media.UploadedByUser)
            .Include(media => media.Usages)
            .AsNoTracking()
            .OrderByDescending(media => media.CreatedAt)
            .Skip((Math.Max(page, 1) - 1) * Math.Clamp(pageSize, 1, 100))
            .Take(Math.Clamp(pageSize, 1, 100))
            .ToListAsync(cancellationToken);
    }

    public Task<int> CountAsync(string? folder, string? search, CancellationToken cancellationToken = default)
    {
        return ApplyFilters(folder, search).CountAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<string>> GetFoldersAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.MediaFiles
            .AsNoTracking()
            .Where(media => media.Folder != null && media.Folder != "")
            .Select(media => media.Folder!)
            .Distinct()
            .OrderBy(folder => folder)
            .ToListAsync(cancellationToken);
    }

    public async Task TrackUsageByPathAsync(string filePath, string entityType, Guid entityId, string fieldName, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(filePath))
        {
            return;
        }

        var mediaFile = await dbContext.MediaFiles.FirstOrDefaultAsync(media => media.FilePath == filePath, cancellationToken);
        if (mediaFile is null)
        {
            return;
        }

        var exists = await dbContext.MediaFileUsages.AnyAsync(usage =>
            usage.MediaFileId == mediaFile.Id &&
            usage.EntityType == entityType &&
            usage.EntityId == entityId &&
            usage.FieldName == fieldName,
            cancellationToken);

        if (exists)
        {
            return;
        }

        dbContext.MediaFileUsages.Add(new MediaFileUsage
        {
            Id = Guid.NewGuid(),
            MediaFileId = mediaFile.Id,
            EntityType = entityType,
            EntityId = entityId,
            FieldName = fieldName,
            CreatedAt = DateTime.UtcNow
        });
    }

    public async Task ClearUsageAsync(string entityType, Guid entityId, string fieldName, CancellationToken cancellationToken = default)
    {
        var usages = await dbContext.MediaFileUsages
            .Where(usage => usage.EntityType == entityType && usage.EntityId == entityId && usage.FieldName == fieldName)
            .ToListAsync(cancellationToken);

        if (usages.Count > 0)
        {
            dbContext.MediaFileUsages.RemoveRange(usages);
        }
    }

    public void Remove(MediaFile mediaFile)
    {
        dbContext.MediaFiles.Remove(mediaFile);
    }

    private IQueryable<MediaFile> ApplyFilters(string? folder, string? search)
    {
        var query = dbContext.MediaFiles.AsQueryable();

        if (!string.IsNullOrWhiteSpace(folder) && !string.Equals(folder, "All", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(media => media.Folder == folder);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(media => EF.Functions.ILike(media.FileName, $"%{search.Trim()}%"));
        }

        return query;
    }
}
