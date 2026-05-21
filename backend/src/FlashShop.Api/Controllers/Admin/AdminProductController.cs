using FlashShop.Application.Inventory.Commands;
using FlashShop.Application.Products.Commands;
using FlashShop.Application.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public sealed class AdminProductController(IMediator mediator, IWebHostEnvironment environment) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken cancellationToken = default)
    {
        var products = await mediator.Send(new GetProductListQuery
        {
            Category = category,
            Search = search,
            Page = page,
            PageSize = pageSize
        }, cancellationToken);

        return Ok(products);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct(
        [FromBody] CreateProductCommand command,
        CancellationToken cancellationToken)
    {
        var productId = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetProducts), new { id = productId }, new { id = productId });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProduct(
        Guid id,
        [FromBody] UpdateProductCommand command,
        CancellationToken cancellationToken)
    {
        command.Id = id;
        await mediator.Send(command, cancellationToken);
        return NoContent();
    }

    [HttpPut("{id:guid}/inventory")]
    public async Task<IActionResult> UpdateInventory(
        Guid id,
        [FromBody] UpdateInventoryCommand command,
        CancellationToken cancellationToken)
    {
        command.ProductId = id;
        var inventory = await mediator.Send(command, cancellationToken);
        return Ok(inventory);
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(IFormFile file, CancellationToken cancellationToken)
    {
        if (file.Length == 0)
        {
            return BadRequest(new { message = "File is required." });
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var allowedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Only jpg, png, and webp images are allowed." });
        }

        var uploadsPath = Path.Combine(environment.WebRootPath ?? Path.Combine(environment.ContentRootPath, "wwwroot"), "uploads");
        Directory.CreateDirectory(uploadsPath);

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var fullPath = Path.Combine(uploadsPath, fileName);
        await using var stream = System.IO.File.Create(fullPath);
        await file.CopyToAsync(stream, cancellationToken);

        return Ok(new { url = $"/uploads/{fileName}" });
    }
}
