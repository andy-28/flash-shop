namespace FlashShop.Application.Media.DTOs;

public sealed record MediaFileUsageDto(
    Guid Id,
    string EntityType,
    Guid EntityId,
    string FieldName,
    DateTime CreatedAt);

public sealed record MediaFileDto(
    Guid Id,
    string FileName,
    string FilePath,
    string? ThumbnailPath,
    string MimeType,
    long FileSize,
    int? Width,
    int? Height,
    string? AltText,
    string? Folder,
    string UploadedByName,
    DateTime CreatedAt,
    int UsageCount);

public sealed record MediaFileDetailDto(
    Guid Id,
    string FileName,
    string FilePath,
    string? ThumbnailPath,
    string MimeType,
    long FileSize,
    int? Width,
    int? Height,
    string? AltText,
    string? Folder,
    string UploadedByName,
    DateTime CreatedAt,
    IReadOnlyCollection<MediaFileUsageDto> Usages);

public sealed record MediaListDto(
    IReadOnlyCollection<MediaFileDto> Items,
    int TotalCount,
    int Page,
    int PageSize);
