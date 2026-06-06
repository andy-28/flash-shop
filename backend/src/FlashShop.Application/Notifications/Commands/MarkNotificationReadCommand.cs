using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Notifications.Commands;

public sealed class MarkNotificationReadCommand : IRequest
{
    public Guid UserId { get; set; }
    public Guid? NotificationId { get; set; }
    public bool MarkAll { get; set; }
}

public sealed class MarkNotificationReadCommandHandler(
    INotificationRepository notificationRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<MarkNotificationReadCommand>
{
    public async Task Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        if (request.MarkAll)
        {
            await notificationRepository.MarkAllReadAsync(request.UserId, cancellationToken);
            return;
        }

        if (!request.NotificationId.HasValue)
        {
            throw new BusinessException("Notification id is required.");
        }

        var notification = await notificationRepository.GetByIdAsync(request.NotificationId.Value, cancellationToken)
            ?? throw new NotFoundException("Notification was not found.");
        if (notification.UserId != request.UserId)
        {
            throw new NotFoundException("Notification was not found.");
        }

        notification.IsRead = true;
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
