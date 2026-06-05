using FlashShop.Domain.Entities;
using FlashShop.Application.Shipments.DTOs;

namespace FlashShop.Application.Orders.DTOs;

public static class OrderMapper
{
    public static OrderDto ToDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            OrderNo = order.OrderNo,
            Status = order.Status,
            TotalAmount = order.TotalAmount,
            DiscountAmount = order.DiscountAmount,
            CouponCode = order.Coupon?.Code,
            ShippingFee = order.ShippingFee,
            FinalAmount = order.FinalAmount,
            CreatedAt = order.CreatedAt,
            PaidAt = order.PaidAt,
            ExpiredAt = order.ExpiredAt,
            ItemCount = order.Items.Sum(x => x.Quantity),
            UserName = order.User?.Name,
            UserEmail = order.User?.Email,
            Items = order.Items
                .OrderBy(x => x.ProductName)
                .Select(x => new OrderItemDto
                {
                    ProductName = x.ProductName,
                    SpecName = x.SpecName,
                    UnitPrice = x.UnitPrice,
                    Quantity = x.Quantity,
                    Subtotal = x.Subtotal
                })
                .ToArray(),
            Payment = order.Payment is null
                ? null
                : new PaymentDto
                {
                    Method = order.Payment.Method,
                    Status = order.Payment.Status,
                    PaidAt = order.Payment.PaidAt,
                    TransactionId = order.Payment.TransactionId
                },
            Shipment = order.Shipment is null ? null : ShipmentMapper.ToDto(order.Shipment)
        };
    }
}
