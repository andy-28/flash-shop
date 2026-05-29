using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Commands;

public sealed class UpdateContentBlockCommand : IRequest<ContentBlockDto>
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string LinkType { get; set; } = "None";
    public string? Body { get; set; }
    public string? Slug { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? StartAt { get; set; }
    public DateTime? EndAt { get; set; }
    public string? ChangeNote { get; set; }
    public Guid ModifiedBy { get; set; }
}

public sealed class UpdateContentBlockCommandHandler(
    IContentRepository contentRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService,
    IMediaRepository mediaRepository) : IRequestHandler<UpdateContentBlockCommand, ContentBlockDto>
{
    public async Task<ContentBlockDto> Handle(UpdateContentBlockCommand request, CancellationToken cancellationToken)
    {
        var block = await contentRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Content block was not found.");

        if (string.IsNullOrWhiteSpace(request.Title))
        {
            throw new BusinessException("Title is required.");
        }

        if (string.IsNullOrWhiteSpace(request.ImageUrl))
        {
            throw new BusinessException("Image URL is required.");
        }

        if (request.StartAt.HasValue && request.EndAt.HasValue && request.StartAt > request.EndAt)
        {
            throw new BusinessException("Start time must be earlier than end time.");
        }

        block.Title = request.Title.Trim();
        block.Subtitle = string.IsNullOrWhiteSpace(request.Subtitle) ? null : request.Subtitle.Trim();
        block.ImageUrl = request.ImageUrl.Trim();
        block.LinkUrl = string.IsNullOrWhiteSpace(request.LinkUrl) ? null : request.LinkUrl.Trim();
        block.LinkType = string.IsNullOrWhiteSpace(request.LinkType) ? "None" : request.LinkType.Trim();
        block.Body = string.IsNullOrWhiteSpace(request.Body) ? null : request.Body.Trim();
        block.Slug = string.IsNullOrWhiteSpace(request.Slug) ? null : request.Slug.Trim();
        block.IsActive = block.Status == "Published" && request.IsActive;
        block.StartAt = request.StartAt;
        block.EndAt = request.EndAt;
        block.Version += 1;
        block.UpdatedAt = DateTime.UtcNow;

        await contentRepository.AddVersionAsync(
            ContentBlockMapper.CreateVersion(block, request.ModifiedBy, string.IsNullOrWhiteSpace(request.ChangeNote) ? "Updated content" : request.ChangeNote.Trim()),
            cancellationToken);
        await mediaRepository.ClearUsageAsync("ContentBlock", block.Id, "ImageUrl", cancellationToken);
        await mediaRepository.TrackUsageByPathAsync(block.ImageUrl, "ContentBlock", block.Id, "ImageUrl", cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveAsync(CacheKeys.Content(block.Placement), cancellationToken);
        return ContentBlockMapper.ToDto(block);
    }
}
