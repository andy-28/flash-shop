using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Orders.Commands;
using FlashShop.Application.Orders.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public sealed class OrderController(IMediator mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetOrders(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var orders = await mediator.Send(new GetOrderListQuery
        {
            UserId = GetUserId(),
            Page = page,
            PageSize = pageSize
        }, cancellationToken);

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new GetOrderDetailQuery
        {
            OrderId = id,
            UserId = GetUserId()
        }, cancellationToken);

        return Ok(order);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new CreateOrderCommand
        {
            UserId = GetUserId()
        }, cancellationToken);

        return Ok(order);
    }

    [HttpPost("{id:guid}/pay")]
    public async Task<IActionResult> ProcessPayment(Guid id, CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new ProcessPaymentCommand
        {
            OrderId = id,
            UserId = GetUserId()
        }, cancellationToken);

        return Ok(order);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id, CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new CancelOrderCommand
        {
            OrderId = id,
            UserId = GetUserId()
        }, cancellationToken);

        return Ok(order);
    }

    private Guid GetUserId()
    {
        return currentUserService.UserId ?? throw new UnauthorizedAccessException();
    }
}
