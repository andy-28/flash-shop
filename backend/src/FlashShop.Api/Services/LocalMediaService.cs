using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;

namespace FlashShop.Api.Services;

public sealed class LocalMediaService : IMediaService
{
    private readonly ILogger<LocalMediaService> _logger;
    private readonly string _basePath;
    private readonly string _requestPath;

    private static readonly HashSet<string> AllowedMimeTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp"
    };

    private static readonly Dictionary<string, string[]> AllowedExtensionsByMimeType = new(StringComparer.OrdinalIgnoreCase)
    {
        ["image/jpeg"] = [".jpg", ".jpeg"],
        ["image/png"] = [".png"],
        ["image/webp"] = [".webp"]
    };

    private const long MaxFileSize = 5 * 1024 * 1024;

    public LocalMediaService(
        IConfiguration configuration,
        IWebHostEnvironment environment,
        ILogger<LocalMediaService> logger)
    {
        var configuredBasePath = configuration["MediaStorage:BasePath"];
        _basePath = string.IsNullOrWhiteSpace(configuredBasePath)
            ? Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads")
            : Path.GetFullPath(configuredBasePath, environment.ContentRootPath);
        _requestPath = NormalizeRequestPath(configuration["MediaStorage:RequestPath"]);
        _logger = logger;

        Directory.CreateDirectory(_basePath);
    }

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
            throw new BusinessException($"Unsupported file type: {mimeType}. Only JPEG, PNG, and WebP are allowed.");
        }

        if (fileStream.Length <= 0)
        {
            throw new BusinessException("File is empty.");
        }

        if (fileStream.Length > MaxFileSize)
        {
            throw new BusinessException("File size cannot exceed 5MB.");
        }

        var extension = Path.GetExtension(Path.GetFileName(fileName)).ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(extension))
        {
            extension = mimeType.ToLowerInvariant() switch
            {
                "image/jpeg" => ".jpg",
                "image/png" => ".png",
                "image/webp" => ".webp",
                _ => ".img"
            };
        }

        if (!AllowedExtensionsByMimeType.TryGetValue(mimeType, out var allowedExtensions) ||
            !allowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
        {
            throw new BusinessException("File extension does not match the allowed image types.");
        }

        var now = DateTime.UtcNow;
        var storedFileName = $"{Guid.NewGuid():N}{extension}";
        var datePath = Path.Combine(now.ToString("yyyy"), now.ToString("MM"));
        var absoluteDir = Path.Combine(_basePath, "media", datePath);
        Directory.CreateDirectory(absoluteDir);

        var absolutePath = Path.Combine(absoluteDir, storedFileName);
        await using (var output = File.Create(absolutePath))
        {
            await fileStream.CopyToAsync(output, cancellationToken);
        }

        var thumbnailPath = await TryCreateThumbnailAsync(absolutePath, absoluteDir, storedFileName, now, cancellationToken);
        var relativePath = $"{_requestPath}/media/{now:yyyy}/{now:MM}";

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
        DeleteIfInsideStorage(filePath);

        if (!string.IsNullOrWhiteSpace(thumbnailPath))
        {
            DeleteIfInsideStorage(thumbnailPath);
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
            return $"{_requestPath}/media/{now:yyyy}/{now:MM}/{thumbFileName}";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to create thumbnail for {FileName}", storedFileName);
            return null;
        }
    }

    private void DeleteIfInsideStorage(string requestPath)
    {
        var relativePath = requestPath;
        if (relativePath.StartsWith(_requestPath, StringComparison.OrdinalIgnoreCase))
        {
            relativePath = relativePath[_requestPath.Length..];
        }

        var absolutePath = Path.GetFullPath(Path.Combine(_basePath, relativePath.TrimStart('/', '\\')));
        var absoluteRoot = Path.GetFullPath(_basePath);
        var rootPrefix = absoluteRoot.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar)
            + Path.DirectorySeparatorChar;
        if (!absolutePath.StartsWith(rootPrefix, StringComparison.OrdinalIgnoreCase))
        {
            return;
        }

        if (File.Exists(absolutePath))
        {
            File.Delete(absolutePath);
        }
    }

    private static string NormalizeRequestPath(string? requestPath)
    {
        var normalized = string.IsNullOrWhiteSpace(requestPath) ? "/uploads" : requestPath.Trim();
        return $"/{normalized.Trim('/', '\\')}";
    }
}
