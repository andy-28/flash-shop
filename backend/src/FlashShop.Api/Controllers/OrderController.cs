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
public sealed class OrderController(IMediator mediator, ICurrentUserService currentUserService) : ApiControllerBase
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

        return OkResponse(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new GetOrderDetailQuery
        {
            OrderId = id,
            UserId = GetUserId()
        }, cancellationToken);

        return OkResponse(order);
    }

    [HttpGet("{id:guid}/shipment")]
    public async Task<IActionResult> GetShipment(Guid id, CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new GetOrderDetailQuery
        {
            OrderId = id,
            UserId = GetUserId()
        }, cancellationToken);

        return OkResponse(order.Shipment);
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest? request, CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new CreateOrderCommand
        {
            UserId = GetUserId(),
            CouponCode = request?.CouponCode
        }, cancellationToken);

        return OkResponse(order);
    }

    [HttpPost("{id:guid}/pay")]
    public async Task<IActionResult> ProcessPayment(Guid id, CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new ProcessPaymentCommand
        {
            OrderId = id,
            UserId = GetUserId()
        }, cancellationToken);

        return OkResponse(order);
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id, CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new CancelOrderCommand
        {
            OrderId = id,
            UserId = GetUserId()
        }, cancellationToken);

        return OkResponse(order);
    }

    private Guid GetUserId()
    {
        return currentUserService.UserId ?? throw new UnauthorizedAccessException();
    }
}

public sealed class CreateOrderRequest
{
    public string? CouponCode { get; set; }
}
