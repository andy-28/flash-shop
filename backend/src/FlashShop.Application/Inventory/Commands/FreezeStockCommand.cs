using FlashShop.Application.Inventory.DTOs;
using MediatR;

namespace FlashShop.Application.Inventory.Commands;

public sealed class FreezeStockCommand : IRequest<InventoryDto>
{
    public Guid VariantId { get; set; }
    public Guid OrderId { get; set; }
    public int Quantity { get; set; }
}

public sealed class FreezeStockCommandHandler : IRequestHandler<FreezeStockCommand, InventoryDto>
{
    public Task<InventoryDto> Handle(FreezeStockCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
