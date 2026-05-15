using MediatR;

namespace FlashShop.Application.Orders.Events;

public sealed class OrderCreatedEvent : INotification
{
    public Guid OrderId { get; set; }
    public DateTime CreatedAt { get; set; }
}
