namespace FlashShop.Application.Content.DTOs;

public sealed record ContentBlockDto(
    Guid Id,
    string Title,
    string? Subtitle,
    string ImageUrl,
    string? LinkUrl,
    string LinkType,
    string Placement,
    string Status,
    string? Body,
    string? Slug,
    string? Category,
    string? VideoUrl,
    string? Summary,
    int ViewCount,
    int Position,
    bool IsActive,
    DateTime? StartAt,
    DateTime? EndAt,
    DateTime? PublishedAt,
    int Version,
    DateTime CreatedAt,
    List<ContentBlockMediaDto> Media);

public sealed record ContentBlockMediaDto(
    Guid Id,
    string MediaType,
    string MediaUrl,
    int Position);

public sealed record ContentVersionDto(
    Guid Id,
    int VersionNumber,
    string Title,
    string? Subtitle,
    string? Body,
    string? Category,
    string? VideoUrl,
    string? Summary,
    string ImageUrl,
    string Placement,
    string ModifiedByName,
    string ChangeNote,
    DateTime CreatedAt);

public sealed record ContentFeedDto(
    Guid Id,
    string Title,
    string? Subtitle,
    string? Summary,
    string? ImageUrl,
    string? VideoUrl,
    string? Category,
    string? Slug,
    int ViewCount,
    DateTime CreatedAt,
    DateTime? PublishedAt);

public sealed record ContentDetailDto(
    Guid Id,
    string Title,
    string? Subtitle,
    string? Body,
    string? Summary,
    string? ImageUrl,
    string? VideoUrl,
    string? Category,
    string? Slug,
    int ViewCount,
    DateTime CreatedAt,
    DateTime? PublishedAt,
    List<ContentBlockMediaDto> Media,
    List<ContentFeedDto> RelatedContents);
