using FlashShop.Application.AuditLog.DTOs;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.AuditLog.Queries;

public sealed class GetAuditLogsQuery : IRequest<AuditLogListDto>
{
    public string? EntityType { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public sealed class GetAuditLogsQueryHandler(IAdminDashboardReadService dashboardReadService)
    : IRequestHandler<GetAuditLogsQuery, AuditLogListDto>
{
    public Task<AuditLogListDto> Handle(GetAuditLogsQuery request, CancellationToken cancellationToken)
    {
        return dashboardReadService.GetAuditLogsAsync(request.EntityType, request.Page, request.PageSize, cancellationToken);
    }
}
