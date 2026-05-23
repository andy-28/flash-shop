namespace FlashShop.Application.Content.DTOs;

public sealed record ContentBlockDto(
    Guid Id,
    string Title,
    string? Subtitle,
    string ImageUrl,
    string? LinkUrl,
    string LinkType,
    string Placement,
    int Position,
    bool IsActive,
    DateTime? StartAt,
    DateTime? EndAt,
    DateTime CreatedAt,
    List<ContentBlockMediaDto> Media);

public sealed record ContentBlockMediaDto(
    Guid Id,
    string MediaType,
    string MediaUrl,
    int Position);
