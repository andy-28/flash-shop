namespace FlashShop.Application.AuditLog.DTOs;

public sealed record AuditLogDto(
    Guid Id,
    string UserName,
    string Action,
    string EntityType,
    Guid EntityId,
    string? Detail,
    DateTime CreatedAt);
