using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/cart")]
public sealed class CartController : ControllerBase
{
    [HttpGet]
    public IActionResult GetCart() => Ok("TODO");

    [HttpPost("items")]
    public IActionResult AddItem() => Ok("TODO");

    [HttpDelete("items/{variantId:guid}")]
    public IActionResult RemoveItem(Guid variantId) => Ok("TODO");
}
