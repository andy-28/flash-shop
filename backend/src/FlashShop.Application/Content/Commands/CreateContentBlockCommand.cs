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
    public bool IsActive { get; set; } = true;
    public DateTime? StartAt { get; set; }
    public DateTime? EndAt { get; set; }
    public Guid CreatedBy { get; set; }
}

public sealed class CreateContentBlockCommandHandler(
    IContentRepository contentRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateContentBlockCommand, ContentBlockDto>
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
            Position = await contentRepository.GetNextPositionAsync(placement, cancellationToken),
            IsActive = request.IsActive,
            StartAt = request.StartAt,
            EndAt = request.EndAt,
            CreatedBy = request.CreatedBy,
            CreatedAt = now,
            UpdatedAt = now
        };

        await contentRepository.AddAsync(block, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return ContentBlockMapper.ToDto(block);
    }
}
