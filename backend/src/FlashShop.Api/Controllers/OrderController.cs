using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/orders")]
public sealed class OrderController : ControllerBase
{
    [HttpGet]
    public IActionResult GetOrders() => Ok("TODO");

    [HttpGet("{id:guid}")]
    public IActionResult GetOrder(Guid id) => Ok("TODO");

    [HttpPost]
    public IActionResult CreateOrder() => Ok("TODO");

    [HttpPost("{id:guid}/cancel")]
    public IActionResult CancelOrder(Guid id) => Ok("TODO");

    [HttpPost("{id:guid}/payment")]
    public IActionResult ProcessPayment(Guid id) => Ok("TODO");
}
