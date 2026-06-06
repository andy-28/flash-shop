using FlashShop.Application.Content.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/content")]
public sealed class ContentController(IMediator mediator) : ApiControllerBase
{
    private static readonly string[] ContentCategories = ["News", "Behind", "Video", "Event"];

    [HttpGet]
    public async Task<IActionResult> GetByPlacement([FromQuery] string placement, CancellationToken cancellationToken)
    {
        var blocks = await mediator.Send(new GetContentByPlacementQuery { Placement = placement }, cancellationToken);
        return OkResponse(blocks);
    }

    [HttpGet("feed/categories")]
    public IActionResult GetFeedCategories()
    {
        return OkResponse(ContentCategories);
    }

    [HttpGet("feed")]
    public async Task<IActionResult> GetFeed([FromQuery] string? category, [FromQuery] int page = 1, [FromQuery] int pageSize = 12, CancellationToken cancellationToken = default)
    {
        var feed = await mediator.Send(new GetContentsFeedQuery { Category = category, Page = page, PageSize = pageSize }, cancellationToken);
        return OkResponse(feed);
    }

    [HttpGet("feed/{id:guid}")]
    public async Task<IActionResult> GetFeedDetail(Guid id, CancellationToken cancellationToken)
    {
        var detail = await mediator.Send(new GetContentDetailQuery { Id = id }, cancellationToken);
        return OkResponse(detail);
    }
}
