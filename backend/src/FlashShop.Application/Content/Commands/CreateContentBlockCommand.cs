using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using FlashShop.Domain.Entities;
using MediatR;

namespace FlashShop.Application.Content.Commands;

public sealed class CreateContentBlockCommand : IRequest<ContentBlockDto>
{
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public string ImageUrl { get; set; } = string.Empty;
    public string? LinkUrl { get; set; }
    public string LinkType { get; set; } = "None";
    public string Placement { get; set; } = string.Empty;
    public string? Body { get; set; }
    public string? Slug { get; set; }
    public bool IsActive { get; set; }
    public DateTime? StartAt { get; set; }
    public DateTime? EndAt { get; set; }
    public Guid CreatedBy { get; set; }
}

public sealed class CreateContentBlockCommandHandler(
    IContentRepository contentRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService,
    IMediaRepository mediaRepository) : IRequestHandler<CreateContentBlockCommand, ContentBlockDto>
{
    public async Task<ContentBlockDto> Handle(CreateContentBlockCommand request, CancellationToken cancellationToken)
    {
        var title = request.Title.Trim();
        var placement = request.Placement.Trim();
        var imageUrl = request.ImageUrl.Trim();
        var linkType = string.IsNullOrWhiteSpace(request.LinkType) ? "None" : request.LinkType.Trim();

        if (string.IsNullOrWhiteSpace(title))
        {
            throw new BusinessException("Title is required.");
        }

        if (string.IsNullOrWhiteSpace(placement))
        {
            throw new BusinessException("Placement is required.");
        }

        if (string.IsNullOrWhiteSpace(imageUrl))
        {
            throw new BusinessException("Image URL is required.");
        }

        if (request.StartAt.HasValue && request.EndAt.HasValue && request.StartAt > request.EndAt)
        {
            throw new BusinessException("Start time must be earlier than end time.");
        }

        var now = DateTime.UtcNow;
        var block = new ContentBlock
        {
            Id = Guid.NewGuid(),
            Title = title,
            Subtitle = string.IsNullOrWhiteSpace(request.Subtitle) ? null : request.Subtitle.Trim(),
            ImageUrl = imageUrl,
            LinkUrl = string.IsNullOrWhiteSpace(request.LinkUrl) ? null : request.LinkUrl.Trim(),
            LinkType = linkType,
            Placement = placement,
            Status = "Draft",
            Body = string.IsNullOrWhiteSpace(request.Body) ? null : request.Body.Trim(),
            Slug = string.IsNullOrWhiteSpace(request.Slug) ? null : request.Slug.Trim(),
            Position = await contentRepository.GetNextPositionAsync(placement, cancellationToken),
            IsActive = false,
            StartAt = request.StartAt,
            EndAt = request.EndAt,
            Version = 1,
            CreatedBy = request.CreatedBy,
            CreatedAt = now,
            UpdatedAt = now
        };

        await contentRepository.AddAsync(block, cancellationToken);
        await contentRepository.AddVersionAsync(ContentBlockMapper.CreateVersion(block, request.CreatedBy, "Initial draft"), cancellationToken);
        await mediaRepository.TrackUsageByPathAsync(block.ImageUrl, "ContentBlock", block.Id, "ImageUrl", cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveAsync(CacheKeys.Content(placement), cancellationToken);

        return ContentBlockMapper.ToDto(block);
    }
}
