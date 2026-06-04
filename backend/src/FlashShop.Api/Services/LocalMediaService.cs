using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;

namespace FlashShop.Api.Services;

public sealed class LocalMediaService(IWebHostEnvironment environment, ILogger<LocalMediaService> logger) : IMediaService
{
    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp"
    };

    private const long MaxFileSize = 5 * 1024 * 1024;

    public async Task<MediaFile> UploadAsync(
        Stream fileStream,
        string fileName,
        string mimeType,
        string? folder,
        Guid uploadedBy,
        CancellationToken cancellationToken = default)
    {
        if (!AllowedMimeTypes.Contains(mimeType))
        {
            throw new BusinessException($"Unsupported file type: {mimeType}. Only JPEG, PNG, GIF, and WebP are allowed.");
        }

        if (fileStream.Length <= 0)
        {
            throw new BusinessException("File is empty.");
        }

        if (fileStream.Length > MaxFileSize)
        {
            throw new BusinessException("File size cannot exceed 5MB.");
        }

        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = mimeType.ToLowerInvariant() switch
            {
                "image/jpeg" => ".jpg",
                "image/png" => ".png",
                "image/gif" => ".gif",
                "image/webp" => ".webp",
                _ => ".img"
            };
        }

        var now = DateTime.UtcNow;
        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        var datePath = Path.Combine(now.ToString("yyyy"), now.ToString("MM"));
        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        var absoluteDir = Path.Combine(webRoot, "uploads", "media", datePath);
        Directory.CreateDirectory(absoluteDir);

        var absolutePath = Path.Combine(absoluteDir, storedFileName);
        await using (var output = File.Create(absolutePath))
        {
            await fileStream.CopyToAsync(output, cancellationToken);
        }

        var thumbnailPath = await TryCreateThumbnailAsync(absolutePath, absoluteDir, storedFileName, now, cancellationToken);
        var relativePath = $"/uploads/media/{now:yyyy}/{now:MM}";

        return new MediaFile
        {
            Id = Guid.NewGuid(),
            FileName = Path.GetFileName(fileName),
            StoredFileName = storedFileName,
            FilePath = $"{relativePath}/{storedFileName}",
            ThumbnailPath = thumbnailPath,
            MimeType = mimeType,
            FileSize = fileStream.Length,
            Folder = string.IsNullOrWhiteSpace(folder) ? null : folder.Trim(),
            UploadedBy = uploadedBy,
            CreatedAt = DateTime.UtcNow
        };
    }

    public Task DeleteFileAsync(string filePath, string? thumbnailPath, CancellationToken cancellationToken = default)
    {
        var webRoot = environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot");
        DeleteIfInsideWebRoot(webRoot, filePath);

        if (!string.IsNullOrWhiteSpace(thumbnailPath))
        {
            DeleteIfInsideWebRoot(webRoot, thumbnailPath);
        }

        return Task.CompletedTask;
    }

    private async Task<string?> TryCreateThumbnailAsync(string absolutePath, string absoluteDir, string storedFileName, DateTime now, CancellationToken cancellationToken)
    {
        try
        {
            var thumbFileName = $"thumb_{storedFileName}";
            var thumbAbsolutePath = Path.Combine(absoluteDir, thumbFileName);
            await using var source = File.OpenRead(absolutePath);
            await using var target = File.Create(thumbAbsolutePath);
            await source.CopyToAsync(target, cancellationToken);
            return $"/uploads/media/{now:yyyy}/{now:MM}/{thumbFileName}";
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to create thumbnail for {FileName}", storedFileName);
            return null;
        }
    }

    private static void DeleteIfInsideWebRoot(string webRoot, string relativePath)
    {
        var absolutePath = Path.GetFullPath(Path.Combine(webRoot, relativePath.TrimStart('/', '\\')));
        var absoluteRoot = Path.GetFullPath(webRoot);
        if (!absolutePath.StartsWith(absoluteRoot, StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        if (File.Exists(absolutePath))
        {
            File.Delete(absolutePath);
        }
    }
}
