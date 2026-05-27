namespace FlashShop.Application.AuditLog.DTOs;

public sealed record AuditLogListDto(
    IReadOnlyCollection<AuditLogDto> Items,
    int TotalCount,
    int Page,
    int PageSize);
