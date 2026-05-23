using FlashShop.Application.Content.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/content")]
public sealed class ContentController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetByPlacement([FromQuery] string placement, CancellationToken cancellationToken)
    {
        var blocks = await mediator.Send(new GetContentByPlacementQuery { Placement = placement }, cancellationToken);
        return Ok(blocks);
    }
}
