using FlashShop.Application.Common.Exceptions;
using FlashShop.Domain.Enums;

namespace FlashShop.Application.Common;

public static class OrderStateMachine
{
    private static readonly Dictionary<OrderStatus, HashSet<OrderStatus>> Transitions = new()
    {
        [OrderStatus.Pending] = [OrderStatus.Paid, OrderStatus.Cancelled, OrderStatus.Expired],
        [OrderStatus.Paid] = [OrderStatus.Shipping],
        [OrderStatus.Shipping] = [OrderStatus.Delivered],
        [OrderStatus.Delivered] = [],
        [OrderStatus.Cancelled] = [],
        [OrderStatus.Expired] = []
    };

    public static bool CanTransition(OrderStatus from, OrderStatus to)
    {
        return Transitions.TryGetValue(from, out var allowed) && allowed.Contains(to);
    }

    public static void ValidateTransition(OrderStatus from, OrderStatus to)
    {
        if (!CanTransition(from, to))
        {
            throw new BusinessException($"Cannot transition order from {from} to {to}.");
        }
    }
}
