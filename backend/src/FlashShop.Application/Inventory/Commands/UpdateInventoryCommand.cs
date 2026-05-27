using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Inventory.DTOs;
using MediatR;

namespace FlashShop.Application.Inventory.Commands;

public sealed class UpdateInventoryCommand : IRequest<InventoryDto>
{
    public Guid ProductId { get; set; }
    public Guid VariantId { get; set; }
    public int TotalStock { get; set; }
    public int AvailableStock { get; set; }
}

public sealed class UpdateInventoryCommandHandler(
    IProductRepository productRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService)
    : IRequestHandler<UpdateInventoryCommand, InventoryDto>
{
    public async Task<InventoryDto> Handle(UpdateInventoryCommand request, CancellationToken cancellationToken)
    {
        var variant = await productRepository.GetVariantAsync(request.VariantId, cancellationToken)
            ?? throw new NotFoundException("Product variant was not found.");

        if (variant.ProductId != request.ProductId)
        {
            throw new NotFoundException("Product variant was not found for this product.");
        }

        var inventory = variant.Inventory
            ?? throw new NotFoundException("Inventory was not found.");

        if (request.TotalStock < inventory.FrozenStock + inventory.SoldCount)
        {
            throw new BusinessException("Total stock cannot be lower than frozen plus sold stock.");
        }

        if (request.AvailableStock < 0 || request.AvailableStock > request.TotalStock - inventory.FrozenStock - inventory.SoldCount)
        {
            throw new BusinessException("Available stock is outside the allowed range.");
        }

        inventory.TotalStock = request.TotalStock;
        inventory.AvailableStock = request.AvailableStock;
        inventory.Version += 1;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveByPrefixAsync(CacheKeys.ProductListPrefix, cancellationToken);
        await cacheService.RemoveAsync(CacheKeys.ProductDetail(request.ProductId), cancellationToken);

        return new InventoryDto
        {
            VariantId = variant.Id,
            TotalStock = inventory.TotalStock,
            AvailableStock = inventory.AvailableStock,
            FrozenStock = inventory.FrozenStock,
            SoldCount = inventory.SoldCount,
            Version = inventory.Version
        };
    }
}
