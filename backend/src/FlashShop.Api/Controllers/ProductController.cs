using FlashShop.Application.Products.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/products")]
public sealed class ProductController(IMediator mediator) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 24,
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

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetProduct(Guid id, CancellationToken cancellationToken)
    {
        var product = await mediator.Send(new GetProductDetailQuery { Id = id }, cancellationToken);
        return OkResponse(product);
    }
}
