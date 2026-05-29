using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Media.Commands;

public sealed class BulkDeleteMediaCommand : IRequest
{
    public IReadOnlyCollection<Guid> Ids { get; set; } = Array.Empty<Guid>();
    public bool Force { get; set; }
}

public sealed class BulkDeleteMediaCommandHandler(
    IMediaRepository mediaRepository,
    IMediaService mediaService,
    IUnitOfWork unitOfWork) : IRequestHandler<BulkDeleteMediaCommand>
{
    public async Task Handle(BulkDeleteMediaCommand request, CancellationToken cancellationToken)
    {
        foreach (var id in request.Ids.Distinct())
        {
            var mediaFile = await mediaRepository.GetByIdAsync(id, cancellationToken)
                ?? throw new NotFoundException("Media file was not found.");

            if (mediaFile.Usages.Count > 0 && !request.Force)
            {
                throw new BusinessException($"Media file {mediaFile.FileName} is used by {mediaFile.Usages.Count} item(s). Use force=true to delete it.");
            }

            await mediaService.DeleteFileAsync(mediaFile.FilePath, mediaFile.ThumbnailPath, cancellationToken);
            mediaRepository.Remove(mediaFile);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
