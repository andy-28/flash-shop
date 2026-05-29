using FlashShop.Application.Media.DTOs;
using FlashShop.Domain.Entities;

namespace FlashShop.Application.Media;

public static class MediaFileMapper
{
    public static MediaFileDto ToDto(MediaFile mediaFile)
    {
        return new MediaFileDto(
            mediaFile.Id,
            mediaFile.FileName,
            mediaFile.FilePath,
            mediaFile.ThumbnailPath,
            mediaFile.MimeType,
            mediaFile.FileSize,
            mediaFile.Width,
            mediaFile.Height,
            mediaFile.AltText,
            mediaFile.Folder,
            mediaFile.UploadedByUser?.Name ?? "Admin",
            mediaFile.CreatedAt,
            mediaFile.Usages.Count);
    }

    public static MediaFileDetailDto ToDetailDto(MediaFile mediaFile)
    {
        return new MediaFileDetailDto(
            mediaFile.Id,
            mediaFile.FileName,
            mediaFile.FilePath,
            mediaFile.ThumbnailPath,
            mediaFile.MimeType,
            mediaFile.FileSize,
            mediaFile.Width,
            mediaFile.Height,
            mediaFile.AltText,
            mediaFile.Folder,
            mediaFile.UploadedByUser?.Name ?? "Admin",
            mediaFile.CreatedAt,
            mediaFile.Usages
                .OrderByDescending(usage => usage.CreatedAt)
                .Select(usage => new MediaFileUsageDto(usage.Id, usage.EntityType, usage.EntityId, usage.FieldName, usage.CreatedAt))
                .ToList());
    }
}
