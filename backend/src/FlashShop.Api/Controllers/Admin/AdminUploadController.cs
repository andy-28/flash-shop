using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Media.Commands;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/upload")]
[Authorize(Roles = "Admin")]
public sealed class AdminUploadController(IMediator mediator, ICurrentUserService currentUser) : ControllerBase
{
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadImage(IFormFile file, [FromForm] string? folder, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        var media = await mediator.Send(new UploadMediaCommand
        {
            FileStream = stream,
            FileName = file.FileName,
            MimeType = file.ContentType,
            Folder = folder,
            UploadedBy = currentUser.UserId ?? Guid.Empty
        }, cancellationToken);

        return Ok(new { url = media.FilePath, media });
    }
}
