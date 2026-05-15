using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductController : ControllerBase
{
    [HttpGet]
    public IActionResult GetProducts() => Ok("TODO");

    [HttpGet("{id:guid}")]
    public IActionResult GetProduct(Guid id) => Ok("TODO");
}
