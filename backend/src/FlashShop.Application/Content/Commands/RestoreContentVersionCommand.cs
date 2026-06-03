using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Commands;

public sealed class RestoreContentVersionCommand : IRequest<ContentBlockDto>
{
    public Guid ContentBlockId { get; set; }
    public Guid VersionId { get; set; }
    public Guid ModifiedBy { get; set; }
}

public sealed class RestoreContentVersionCommandHandler(
    IContentRepository contentRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<RestoreContentVersionCommand, ContentBlockDto>
{
    public async Task<ContentBlockDto> Handle(RestoreContentVersionCommand request, CancellationToken cancellationToken)
    {
        var block = await contentRepository.GetByIdAsync(request.ContentBlockId, cancellationToken)
            ?? throw new NotFoundException("Content block was not found.");
        var version = await contentRepository.GetVersionAsync(request.ContentBlockId, request.VersionId, cancellationToken)
            ?? throw new NotFoundException("Content version was not found.");

        if (block.Status == "Archived")
        {
            block.Status = "Draft";
            block.IsActive = false;
        }

        block.Title = version.Title;
        block.Subtitle = version.Subtitle;
        block.Body = version.Body;
        block.Category = version.Category;
        block.VideoUrl = version.VideoUrl;
        block.Summary = version.Summary;
        block.ImageUrl = version.ImageUrl;
        block.LinkUrl = version.LinkUrl;
        block.LinkType = version.LinkType;
        block.Placement = version.Placement;
        block.StartAt = version.StartAt;
        block.EndAt = version.EndAt;
        block.Version += 1;
        block.UpdatedAt = DateTime.UtcNow;

        await contentRepository.AddVersionAsync(
            ContentBlockMapper.CreateVersion(block, request.ModifiedBy, $"Restored to version {version.VersionNumber}"),
            cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveAsync(CacheKeys.Content(block.Placement), cancellationToken);
        return ContentBlockMapper.ToDto(block);
    }
}
