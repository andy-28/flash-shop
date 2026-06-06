using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using MediatR;

namespace FlashShop.Application.PreOrders.Commands;

public sealed class MarkArrivalCommand : IRequest<int>
{
    public Guid VariantId { get; set; }
    public int ArrivalStock { get; set; }
}

public sealed class MarkArrivalCommandHandler(
    IProductRepository productRepository,
    IOrderRepository orderRepository,
    INotificationRepository notificationRepository,
    ICacheService cacheService,
    IUnitOfWork unitOfWork)
    : IRequestHandler<MarkArrivalCommand, int>
{
    public async Task<int> Handle(MarkArrivalCommand request, CancellationToken cancellationToken)
    {
        if (request.ArrivalStock <= 0)
        {
            throw new BusinessException("Arrival stock must be greater than zero.");
        }

        var variant = await productRepository.GetVariantAsync(request.VariantId, cancellationToken)
            ?? throw new NotFoundException("Product variant was not found.");
        var product = variant.Product ?? throw new NotFoundException("Product was not found.");
        var inventory = variant.Inventory ?? throw new NotFoundException("Inventory was not found.");
        var now = DateTime.UtcNow;

        variant.IsPreOrder = false;
        variant.EstimatedArrivalDate = null;
        inventory.TotalStock += request.ArrivalStock;
        inventory.AvailableStock += request.ArrivalStock;
        inventory.Version += 1;

        var preOrders = await orderRepository.ListPreOrdersForVariantAsync(request.VariantId, cancellationToken);
        foreach (var order in preOrders)
        {
            OrderStateMachine.ValidateTransition(order.Status, OrderStatus.Pending);
            order.Status = OrderStatus.Pending;
            order.ExpiredAt = now.AddDays(3);

            await notificationRepository.AddAsync(new Notification
            {
                Id = Guid.NewGuid(),
                UserId = order.UserId,
                Type = "PreOrderArrival",
                Title = "您預購的商品已到貨！",
                Message = $"「{product.Name} - {variant.SpecName}」已到貨，請在 3 天內完成付款。",
                LinkUrl = $"/orders/{order.Id}",
                IsRead = false,
                CreatedAt = now
            }, cancellationToken);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveByPrefixAsync(CacheKeys.ProductListPrefix, cancellationToken);
        await cacheService.RemoveAsync(CacheKeys.ProductDetail(product.Id), cancellationToken);
        return preOrders.Count;
    }
}
