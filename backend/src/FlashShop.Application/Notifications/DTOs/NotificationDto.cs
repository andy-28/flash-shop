using FlashShop.Domain.Entities;

namespace FlashShop.Application.Notifications.DTOs;

public sealed record NotificationDto(
    Guid Id,
    string Type,
    string Title,
    string Message,
    string? LinkUrl,
    bool IsRead,
    DateTime CreatedAt);

public static class NotificationMapper
{
    public static NotificationDto ToDto(Notification notification)
    {
        return new NotificationDto(
            notification.Id,
            notification.Type,
            notification.Title,
            notification.Message,
            notification.LinkUrl,
            notification.IsRead,
            notification.CreatedAt);
    }
}
