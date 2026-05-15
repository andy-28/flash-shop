using FlashShop.Application.Inventory.DTOs;
using MediatR;

namespace FlashShop.Application.Inventory.Commands;

public sealed class ReleaseStockCommand : IRequest<InventoryDto>
{
    public Guid VariantId { get; set; }
    public Guid OrderId { get; set; }
    public int Quantity { get; set; }
}

public sealed class ReleaseStockCommandHandler : IRequestHandler<ReleaseStockCommand, InventoryDto>
{
    public Task<InventoryDto> Handle(ReleaseStockCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
