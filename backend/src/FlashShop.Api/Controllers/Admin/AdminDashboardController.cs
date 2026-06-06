using FlashShop.Application.AuditLog.Queries;
using FlashShop.Application.Dashboard.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public sealed class AdminDashboardController(IMediator mediator) : ApiControllerBase
{
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        return OkResponse(await mediator.Send(new GetDashboardSummaryQuery(), cancellationToken));
    }

    [HttpGet("/api/admin/audit-logs")]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] string? entityType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        return OkResponse(await mediator.Send(new GetAuditLogsQuery
        {
            EntityType = entityType,
            Page = page,
            PageSize = pageSize
        }, cancellationToken));
    }
}
