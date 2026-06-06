using FlashShop.Application.Cart.Commands;
using FlashShop.Application.Cart.Queries;
using FlashShop.Application.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize]
public sealed class CartController(IMediator mediator, ICurrentUserService currentUserService) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCart(CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var cart = await mediator.Send(new GetCartQuery { UserId = userId }, cancellationToken);
        return OkResponse(cart);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddToCartRequest request, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var cart = await mediator.Send(new AddToCartCommand
        {
            UserId = userId,
            VariantId = request.VariantId,
            Quantity = request.Quantity
        }, cancellationToken);

        return OkResponse(cart);
    }

    [HttpPut("items/{cartItemId:guid}")]
    public async Task<IActionResult> UpdateItem(
        Guid cartItemId,
        [FromBody] UpdateCartItemRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var cart = await mediator.Send(new UpdateCartItemCommand
        {
            UserId = userId,
            CartItemId = cartItemId,
            Quantity = request.Quantity
        }, cancellationToken);

        return OkResponse(cart);
    }

    [HttpDelete("items/{cartItemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid cartItemId, CancellationToken cancellationToken)
    {
        var userId = GetUserId();
        var cart = await mediator.Send(new RemoveFromCartCommand
        {
            UserId = userId,
            CartItemId = cartItemId
        }, cancellationToken);

        return OkResponse(cart);
    }

    private Guid GetUserId()
    {
        return currentUserService.UserId ?? throw new UnauthorizedAccessException();
    }
}

public sealed class AddToCartRequest
{
    public Guid VariantId { get; set; }
    public int Quantity { get; set; }
}

public sealed class UpdateCartItemRequest
{
    public int Quantity { get; set; }
}
