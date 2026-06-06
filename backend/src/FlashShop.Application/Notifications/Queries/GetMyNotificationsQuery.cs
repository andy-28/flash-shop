using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Common.Models;
using FlashShop.Application.Notifications.DTOs;
using MediatR;

namespace FlashShop.Application.Notifications.Queries;

public sealed class GetMyNotificationsQuery : IRequest<PagedResult<NotificationDto>>
{
    public Guid UserId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public sealed class GetMyNotificationsQueryHandler(INotificationRepository notificationRepository)
    : IRequestHandler<GetMyNotificationsQuery, PagedResult<NotificationDto>>
{
    public async Task<PagedResult<NotificationDto>> Handle(GetMyNotificationsQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(request.Page, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var items = await notificationRepository.ListForUserAsync(request.UserId, page, pageSize, cancellationToken);
        var total = await notificationRepository.CountForUserAsync(request.UserId, cancellationToken);
        return new PagedResult<NotificationDto>(items.Select(NotificationMapper.ToDto).ToList(), total, page, pageSize);
    }
}
