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
            block.Position,
            block.IsActive,
            block.StartAt,
            block.EndAt,
            block.CreatedAt,
            block.Media
                .OrderBy(media => media.Position)
                .Select(media => new ContentBlockMediaDto(media.Id, media.MediaType, media.MediaUrl, media.Position))
                .ToList());
    }
}
