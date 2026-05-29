using FlashShop.Domain.Entities;

namespace FlashShop.Application.Common.Interfaces;

public interface IMediaService
{
    Task<MediaFile> UploadAsync(Stream fileStream, string fileName, string mimeType, string? folder, Guid uploadedBy, CancellationToken cancellationToken = default);
    Task DeleteFileAsync(string filePath, string? thumbnailPath, CancellationToken cancellationToken = default);
}
