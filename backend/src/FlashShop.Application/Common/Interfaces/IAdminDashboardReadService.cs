using FlashShop.Application.AuditLog.DTOs;
using FlashShop.Application.Dashboard.DTOs;

namespace FlashShop.Application.Common.Interfaces;

public interface IAdminDashboardReadService
{
    Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken);
    Task<AuditLogListDto> GetAuditLogsAsync(string? entityType, int page, int pageSize, CancellationToken cancellationToken);
}
