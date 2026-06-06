using FlashShop.Application.Inventory.Commands;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Media.Commands;
using FlashShop.Application.Products.Commands;
using FlashShop.Application.Products.Queries;
using FlashShop.Application.PreOrders.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/products")]
[Authorize(Roles = "Admin")]
public sealed class AdminProductController(IMediator mediator, ICurrentUserService currentUser) : ApiControllerBase
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

        return OkResponse(products);
    }

    [HttpPost]
    public async Task<IActionResult> CreateProduct(
        [FromBody] CreateProductCommand command,
        CancellationToken cancellationToken)
    {
        var productId = await mediator.Send(command, cancellationToken);
        return CreatedResponse(new { id = productId });
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProduct(
        Guid id,
        [FromBody] UpdateProductCommand command,
        CancellationToken cancellationToken)
    {
        command.Id = id;
        await mediator.Send(command, cancellationToken);
        return OkMessage("Operation completed successfully.");
    }

    [HttpPut("{id:guid}/inventory")]
    public async Task<IActionResult> UpdateInventory(
        Guid id,
        [FromBody] UpdateInventoryCommand command,
        CancellationToken cancellationToken)
    {
        command.ProductId = id;
        var inventory = await mediator.Send(command, cancellationToken);
        return OkResponse(inventory);
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        var media = await mediator.Send(new UploadMediaCommand
        {
            FileStream = stream,
            FileName = file.FileName,
            MimeType = file.ContentType,
            Folder = "products",
            UploadedBy = currentUser.UserId ?? Guid.Empty
        }, cancellationToken);

        return OkResponse(new { url = media.FilePath, media });
    }

    [HttpPost("variants/{variantId:guid}/mark-arrival")]
    public async Task<IActionResult> MarkArrival(
        Guid variantId,
        [FromBody] MarkArrivalRequest request,
        CancellationToken cancellationToken)
    {
        var notifiedOrders = await mediator.Send(new MarkArrivalCommand
        {
            VariantId = variantId,
            ArrivalStock = request.ArrivalStock
        }, cancellationToken);

        return OkResponse(new { notifiedOrders });
    }
}

public sealed record MarkArrivalRequest(int ArrivalStock);
