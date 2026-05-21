using FlashShop.Application.Orders.Queries;
using FlashShop.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/orders")]
[Authorize(Roles = "Admin")]
public sealed class AdminOrderController(IMediator mediator) : ControllerBase
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

        return Ok(orders);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id, CancellationToken cancellationToken)
    {
        var order = await mediator.Send(new GetOrderDetailQuery
        {
            OrderId = id,
            IsAdmin = true
        }, cancellationToken);

        return Ok(order);
    }
}
