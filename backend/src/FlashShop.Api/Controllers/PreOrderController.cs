using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.PreOrders.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/pre-orders")]
[Authorize]
public sealed class PreOrderController(IMediator mediator, ICurrentUserService currentUserService) : ApiControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreatePreOrder([FromBody] CreatePreOrderRequest request, CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new CreatePreOrderCommand
        {
            UserId = GetUserId(),
            VariantId = request.VariantId,
            Quantity = request.Quantity <= 0 ? 1 : request.Quantity
        }, cancellationToken);

        return OkResponse(order);
    }

    [HttpDelete("{orderId:guid}")]
    public async Task<IActionResult> CancelPreOrder(Guid orderId, CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new CancelPreOrderCommand
        {
            OrderId = orderId,
            UserId = GetUserId()
        }, cancellationToken);

        return OkResponse(order);
    }

    private Guid GetUserId()
    {
        return currentUserService.UserId ?? throw new UnauthorizedAccessException();
    }
}

public sealed record CreatePreOrderRequest(Guid VariantId, int Quantity = 1);
