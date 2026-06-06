using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Notifications.Queries;

public sealed class GetUnreadCountQuery : IRequest<int>
{
    public Guid UserId { get; set; }
}

public sealed class GetUnreadCountQueryHandler(INotificationRepository notificationRepository)
    : IRequestHandler<GetUnreadCountQuery, int>
{
    public Task<int> Handle(GetUnreadCountQuery request, CancellationToken cancellationToken)
    {
        return notificationRepository.CountUnreadAsync(request.UserId, cancellationToken);
    }
}
