using FlashShop.Application.Content.DTOs;
using FlashShop.Domain.Entities;

namespace FlashShop.Application.Content;

public static class ContentBlockMapper
{
    public static ContentBlockDto ToDto(ContentBlock block)
    {
        return new ContentBlockDto(
            block.Id,
            block.Title,
            block.Subtitle,
            block.ImageUrl,
            block.LinkUrl,
            block.LinkType,
            block.Placement,
            block.Status,
            block.Body,
            block.Slug,
            block.Category,
            block.VideoUrl,
            block.Summary,
            block.ViewCount,
            block.Position,
            block.IsActive,
            block.StartAt,
            block.EndAt,
            block.PublishedAt,
            block.Version,
            block.CreatedAt,
            block.Media
                .OrderBy(media => media.Position)
                .Select(media => new ContentBlockMediaDto(media.Id, media.MediaType, media.MediaUrl, media.Position))
                .ToList());
    }

    public static ContentVersion CreateVersion(ContentBlock block, Guid modifiedBy, string changeNote)
    {
        return new ContentVersion
        {
            Id = Guid.NewGuid(),
            ContentBlockId = block.Id,
            VersionNumber = block.Version,
            Title = block.Title,
            Subtitle = block.Subtitle,
            Body = block.Body,
            Category = block.Category,
            VideoUrl = block.VideoUrl,
            Summary = block.Summary,
            ImageUrl = block.ImageUrl,
            LinkUrl = block.LinkUrl,
            LinkType = block.LinkType,
            Placement = block.Placement,
            IsActive = block.IsActive,
            StartAt = block.StartAt,
            EndAt = block.EndAt,
            ModifiedBy = modifiedBy,
            ChangeNote = changeNote,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static ContentVersionDto ToVersionDto(ContentVersion version)
    {
        return new ContentVersionDto(
            version.Id,
            version.VersionNumber,
            version.Title,
            version.Subtitle,
            version.Body,
            version.Category,
            version.VideoUrl,
            version.Summary,
            version.ImageUrl,
            version.Placement,
            version.ModifiedByUser.Name,
            version.ChangeNote,
            version.CreatedAt);
    }

    public static ContentFeedDto ToFeedDto(ContentBlock block)
    {
        return new ContentFeedDto(
            block.Id,
            block.Title,
            block.Subtitle,
            block.Summary,
            block.ImageUrl,
            block.VideoUrl,
            block.Category,
            block.Slug,
            block.ViewCount,
            block.CreatedAt,
            block.PublishedAt);
    }

    public static ContentDetailDto ToDetailDto(ContentBlock block, IEnumerable<ContentBlock> related)
    {
        return new ContentDetailDto(
            block.Id,
            block.Title,
            block.Subtitle,
            block.Body,
            block.Summary,
            block.ImageUrl,
            block.VideoUrl,
            block.Category,
            block.Slug,
            block.ViewCount,
            block.CreatedAt,
            block.PublishedAt,
            block.Media
                .OrderBy(media => media.Position)
                .Select(media => new ContentBlockMediaDto(media.Id, media.MediaType, media.MediaUrl, media.Position))
                .ToList(),
            related.Select(ToFeedDto).ToList());
    }
}
