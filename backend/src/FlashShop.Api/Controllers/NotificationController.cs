using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Notifications.Commands;
using FlashShop.Application.Notifications.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public sealed class NotificationController(IMediator mediator, ICurrentUserService currentUserService) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetNotifications([FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var notifications = await mediator.Send(new GetMyNotificationsQuery
        {
            UserId = GetUserId(),
            Page = page,
            PageSize = pageSize
        }, cancellationToken);

        return OkResponse(notifications);
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken)
    {
        var count = await mediator.Send(new GetUnreadCountQuery { UserId = GetUserId() }, cancellationToken);
        return OkResponse(new { count });
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new MarkNotificationReadCommand
        {
            UserId = GetUserId(),
            NotificationId = id
        }, cancellationToken);
        return OkMessage("Operation completed successfully.");
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead(CancellationToken cancellationToken)
    {
        await mediator.Send(new MarkNotificationReadCommand
        {
            UserId = GetUserId(),
            MarkAll = true
        }, cancellationToken);
        return OkMessage("Operation completed successfully.");
    }

    private Guid GetUserId()
    {
        return currentUserService.UserId ?? throw new UnauthorizedAccessException();
    }
}
