using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Orders.DTOs;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using MediatR;

namespace FlashShop.Application.PreOrders.Commands;

public sealed class CreatePreOrderCommand : IRequest<OrderDto>
{
    public Guid UserId { get; set; }
    public Guid VariantId { get; set; }
    public int Quantity { get; set; } = 1;
}

public sealed class CreatePreOrderCommandHandler(
    IProductRepository productRepository,
    IOrderRepository orderRepository,
    IUnitOfWork unitOfWork)
    : IRequestHandler<CreatePreOrderCommand, OrderDto>
{
    public async Task<OrderDto> Handle(CreatePreOrderCommand request, CancellationToken cancellationToken)
    {
        if (request.Quantity <= 0)
        {
            throw new BusinessException("Quantity must be greater than zero.");
        }

        var variant = await productRepository.GetVariantAsync(request.VariantId, cancellationToken)
            ?? throw new NotFoundException("Product variant was not found.");
        var product = variant.Product ?? throw new NotFoundException("Product was not found.");
        if (!variant.IsPreOrder)
        {
            throw new BusinessException("此商品不是預購商品。");
        }

        var hasPreOrder = await orderRepository.HasActivePreOrderAsync(request.UserId, request.VariantId, cancellationToken);
        if (hasPreOrder)
        {
            throw new BusinessException("您已預購過此商品。");
        }

        var now = DateTime.UtcNow;
        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = request.UserId,
            OrderNo = await GenerateOrderNoAsync(now, cancellationToken),
            OrderType = "PreOrder",
            Status = OrderStatus.PreOrdered,
            CreatedAt = now,
            ExpiredAt = now.AddYears(1),
            ShippingFee = 0,
            DiscountAmount = 0
        };

        var subtotal = variant.Price * request.Quantity;
        order.Items.Add(new OrderItem
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            VariantId = variant.Id,
            ProductName = product.Name,
            SpecName = variant.SpecName,
            UnitPrice = variant.Price,
            Quantity = request.Quantity,
            Subtotal = subtotal
        });
        order.TotalAmount = subtotal;
        order.FinalAmount = subtotal;
        order.Payment = new Payment
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            Method = "Mock",
            Status = PaymentStatus.Pending,
            Amount = order.FinalAmount,
            CreatedAt = now
        };
        variant.PreOrderCount += request.Quantity;

        await orderRepository.AddAsync(order, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var createdOrder = await orderRepository.GetByIdAsync(order.Id, cancellationToken)
            ?? throw new NotFoundException("Order was not found after creation.");
        return OrderMapper.ToDto(createdOrder);
    }

    private async Task<string> GenerateOrderNoAsync(DateTime now, CancellationToken cancellationToken)
    {
        var lastOrderNo = await orderRepository.GetLastOrderNoForDateAsync(now.Date, cancellationToken);
        var next = 1;
        if (!string.IsNullOrWhiteSpace(lastOrderNo))
        {
            var suffix = lastOrderNo.Split('-').LastOrDefault();
            if (int.TryParse(suffix, out var current))
            {
                next = current + 1;
            }
        }

        return $"ORD-{now:yyyyMMdd}-{next:0000}";
    }
}
