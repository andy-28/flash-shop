using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/products")]
public sealed class AdminProductController : ControllerBase
{
    [HttpGet]
    public IActionResult GetProducts() => Ok("TODO");

    [HttpPost]
    public IActionResult CreateProduct() => Ok("TODO");

    [HttpPut("{id:guid}")]
    public IActionResult UpdateProduct(Guid id) => Ok("TODO");
}
