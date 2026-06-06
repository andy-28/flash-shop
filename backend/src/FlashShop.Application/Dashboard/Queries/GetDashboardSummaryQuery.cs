using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Dashboard.DTOs;
using MediatR;

namespace FlashShop.Application.Dashboard.Queries;

public sealed record GetDashboardSummaryQuery : IRequest<DashboardSummaryDto>;

public sealed class GetDashboardSummaryQueryHandler(IAdminDashboardReadService dashboardReadService)
    : IRequestHandler<GetDashboardSummaryQuery, DashboardSummaryDto>
{
    public Task<DashboardSummaryDto> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        return dashboardReadService.GetSummaryAsync(cancellationToken);
    }
}
