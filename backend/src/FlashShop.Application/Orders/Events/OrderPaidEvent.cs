using MediatR;

namespace FlashShop.Application.Orders.Events;

public sealed class OrderPaidEvent : INotification
{
    public Guid OrderId { get; set; }
    public DateTime PaidAt { get; set; }
}
