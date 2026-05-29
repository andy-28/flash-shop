using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Infrastructure.Persistence.Repositories;

public sealed class ContentRepository(AppDbContext dbContext) : IContentRepository
{
    public async Task<int> GetNextPositionAsync(string placement, CancellationToken cancellationToken = default)
    {
        var maxPosition = await dbContext.ContentBlocks
            .Where(block => block.Placement == placement)
            .MaxAsync(block => (int?)block.Position, cancellationToken);

        return (maxPosition ?? -1) + 1;
    }

    public Task<ContentBlock?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return dbContext.ContentBlocks
            .Include(block => block.Media)
            .Include(block => block.Versions)
            .FirstOrDefaultAsync(block => block.Id == id, cancellationToken);
    }

    public Task<ContentVersion?> GetVersionAsync(Guid contentBlockId, Guid versionId, CancellationToken cancellationToken = default)
    {
        return dbContext.ContentVersions
            .Include(version => version.ModifiedByUser)
            .FirstOrDefaultAsync(version => version.ContentBlockId == contentBlockId && version.Id == versionId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<ContentBlock>> ListPublicByPlacementAsync(
        string placement,
        DateTime now,
        CancellationToken cancellationToken = default)
    {
        return await dbContext.ContentBlocks
            .Include(block => block.Media)
            .AsNoTracking()
            .Where(block => block.Placement == placement)
            .Where(block => block.Status == "Published" && block.IsActive)
            .Where(block => block.StartAt == null || block.StartAt <= now)
            .Where(block => block.EndAt == null || block.EndAt >= now)
            .OrderBy(block => block.Position)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<ContentBlock>> ListAdminAsync(
        string? placement,
        CancellationToken cancellationToken = default)
    {
        var query = dbContext.ContentBlocks
            .Include(block => block.Media)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(placement))
        {
            query = query.Where(block => block.Placement == placement);
        }

        return await query
            .OrderBy(block => block.Placement)
            .ThenBy(block => block.Position)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyCollection<ContentBlock>> ListByPlacementAsync(string placement, CancellationToken cancellationToken = default)
    {
        return await dbContext.ContentBlocks
            .Include(block => block.Media)
            .Where(block => block.Placement == placement)
            .OrderBy(block => block.Position)
            .ToListAsync(cancellationToken);
    }

    public Task AddAsync(ContentBlock block, CancellationToken cancellationToken = default)
    {
        return dbContext.ContentBlocks.AddAsync(block, cancellationToken).AsTask();
    }

    public async Task<IReadOnlyCollection<ContentVersion>> ListVersionsAsync(Guid contentBlockId, CancellationToken cancellationToken = default)
    {
        return await dbContext.ContentVersions
            .Include(version => version.ModifiedByUser)
            .AsNoTracking()
            .Where(version => version.ContentBlockId == contentBlockId)
            .OrderByDescending(version => version.VersionNumber)
            .ToListAsync(cancellationToken);
    }

    public Task AddVersionAsync(ContentVersion version, CancellationToken cancellationToken = default)
    {
        return dbContext.ContentVersions.AddAsync(version, cancellationToken).AsTask();
    }

    public void Remove(ContentBlock block)
    {
        dbContext.ContentBlocks.Remove(block);
    }
}
