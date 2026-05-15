using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/orders")]
public sealed class AdminOrderController : ControllerBase
{
    [HttpGet]
    public IActionResult GetOrders() => Ok("TODO");

    [HttpPut("{id:guid}/status")]
    public IActionResult UpdateOrderStatus(Guid id) => Ok("TODO");
}
