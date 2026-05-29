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
        command.ModifiedBy = currentUserService.UserId ?? throw new UnauthorizedAccessException();
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

    [HttpPost("{id:guid}/publish")]
    public async Task<IActionResult> PublishContent(Guid id, CancellationToken cancellationToken)
    {
        var block = await mediator.Send(new PublishContentBlockCommand { Id = id }, cancellationToken);
        return Ok(block);
    }

    [HttpPost("{id:guid}/unpublish")]
    public async Task<IActionResult> UnpublishContent(Guid id, CancellationToken cancellationToken)
    {
        var block = await mediator.Send(new UnpublishContentBlockCommand { Id = id }, cancellationToken);
        return Ok(block);
    }

    [HttpPost("{id:guid}/archive")]
    public async Task<IActionResult> ArchiveContent(Guid id, CancellationToken cancellationToken)
    {
        var block = await mediator.Send(new ArchiveContentBlockCommand { Id = id }, cancellationToken);
        return Ok(block);
    }

    [HttpGet("{id:guid}/versions")]
    public async Task<IActionResult> GetVersions(Guid id, CancellationToken cancellationToken)
    {
        var versions = await mediator.Send(new GetContentVersionsQuery { ContentBlockId = id }, cancellationToken);
        return Ok(versions);
    }

    [HttpPost("{id:guid}/restore")]
    public async Task<IActionResult> RestoreVersion(Guid id, [FromBody] RestoreVersionRequest request, CancellationToken cancellationToken)
    {
        var block = await mediator.Send(new RestoreContentVersionCommand
        {
            ContentBlockId = id,
            VersionId = request.VersionId,
            ModifiedBy = currentUserService.UserId ?? throw new UnauthorizedAccessException()
        }, cancellationToken);
        return Ok(block);
    }

    [HttpGet("{id:guid}/preview")]
    public async Task<IActionResult> PreviewContent(Guid id, CancellationToken cancellationToken)
    {
        var block = await mediator.Send(new GetContentPreviewQuery { Id = id }, cancellationToken);
        return Ok(block);
    }

    [HttpPut("reorder")]
    public async Task<IActionResult> ReorderContent([FromBody] ReorderContentBlocksCommand command, CancellationToken cancellationToken)
    {
        await mediator.Send(command, cancellationToken);
        return NoContent();
    }
}

public sealed record RestoreVersionRequest(Guid VersionId);
