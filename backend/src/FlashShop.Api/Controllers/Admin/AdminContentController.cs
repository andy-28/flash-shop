using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.Commands;
using FlashShop.Application.Content.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/content")]
[Authorize(Roles = "Admin")]
public sealed class AdminContentController(IMediator mediator, ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetContent([FromQuery] string? placement, CancellationToken cancellationToken)
    {
        var blocks = await mediator.Send(new GetAdminContentListQuery { Placement = placement }, cancellationToken);
        return Ok(blocks);
    }

    [HttpPost]
    public async Task<IActionResult> CreateContent([FromBody] CreateContentBlockCommand command, CancellationToken cancellationToken)
    {
        command.CreatedBy = currentUserService.UserId ?? throw new UnauthorizedAccessException();
        var block = await mediator.Send(command, cancellationToken);
        return Ok(block);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateContent(Guid id, [FromBody] UpdateContentBlockCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var block = await mediator.Send(command, cancellationToken);
        return Ok(block);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteContent(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteContentBlockCommand { Id = id }, cancellationToken);
        return NoContent();
    }

    [HttpPatch("{id:guid}/toggle")]
    public async Task<IActionResult> ToggleContent(Guid id, CancellationToken cancellationToken)
    {
        var block = await mediator.Send(new ToggleContentBlockCommand { Id = id }, cancellationToken);
        return Ok(block);
    }

    [HttpPut("reorder")]
    public async Task<IActionResult> ReorderContent([FromBody] ReorderContentBlocksCommand command, CancellationToken cancellationToken)
    {
        await mediator.Send(command, cancellationToken);
        return NoContent();
    }
}
