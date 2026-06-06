using FlashShop.Application.Orders.Queries;
using FlashShop.Application.Shipments.Commands;
using FlashShop.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public sealed class AdminOrderController(IMediator mediator) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetOrders(
        [FromQuery] OrderStatus? status,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var orders = await mediator.Send(new GetOrderListQuery
        {
            IsAdmin = true,
            Status = status,
            From = from,
            To = to,
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
            IsAdmin = true
        }, cancellationToken);

        return OkResponse(order);
    }

    [HttpPost("{id:guid}/ship")]
    public async Task<IActionResult> ShipOrder(Guid id, [FromBody] ShipOrderRequest request, CancellationToken cancellationToken)
    {
        var shipment = await mediator.Send(new CreateShipmentCommand
        {
            OrderId = id,
            Carrier = request.Carrier,
            TrackingNo = request.TrackingNo
        }, cancellationToken);

        return OkResponse(shipment);
    }

    [HttpPost("{id:guid}/deliver")]
    public async Task<IActionResult> DeliverOrder(Guid id, CancellationToken cancellationToken)
    {
        var shipment = await mediator.Send(new MarkDeliveredCommand { OrderId = id }, cancellationToken);
        return OkResponse(shipment);
    }

    [HttpPut("{id:guid}/tracking")]
    public async Task<IActionResult> UpdateTracking(Guid id, [FromBody] UpdateTrackingRequest request, CancellationToken cancellationToken)
    {
        var shipment = await mediator.Send(new UpdateTrackingCommand
        {
            OrderId = id,
            TrackingNo = request.TrackingNo
        }, cancellationToken);

        return OkResponse(shipment);
    }
}

public sealed record ShipOrderRequest(string Carrier, string? TrackingNo);
public sealed record UpdateTrackingRequest(string? TrackingNo);
