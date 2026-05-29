using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Media.Commands;
using FlashShop.Application.Media.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/media")]
[Authorize(Roles = "Admin")]
public sealed class AdminMediaController(IMediator mediator, ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(
        IFormFile file,
        [FromForm] string? folder,
        [FromForm] string? altText,
        CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        var media = await mediator.Send(new UploadMediaCommand
        {
            FileStream = stream,
            FileName = file.FileName,
            MimeType = file.ContentType,
            Folder = folder,
            AltText = altText,
            UploadedBy = currentUser.UserId ?? Guid.Empty
        }, cancellationToken);

        return Ok(media);
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? folder,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 24,
        CancellationToken cancellationToken = default)
    {
        var result = await mediator.Send(new GetMediaListQuery
        {
            Folder = folder,
            Search = search,
            Page = page,
            PageSize = pageSize
        }, cancellationToken);

        return Ok(result);
    }

    [HttpGet("folders")]
    public async Task<IActionResult> Folders(CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetMediaFoldersQuery(), cancellationToken));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Detail(Guid id, CancellationToken cancellationToken)
    {
        return Ok(await mediator.Send(new GetMediaDetailQuery { Id = id }, cancellationToken));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateMediaCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        return Ok(await mediator.Send(command, cancellationToken));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] bool force, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteMediaCommand { Id = id, Force = force }, cancellationToken);
        return NoContent();
    }

    [HttpPost("bulk-delete")]
    public async Task<IActionResult> BulkDelete([FromBody] BulkDeleteMediaCommand command, CancellationToken cancellationToken)
    {
        await mediator.Send(command, cancellationToken);
        return NoContent();
    }
}
