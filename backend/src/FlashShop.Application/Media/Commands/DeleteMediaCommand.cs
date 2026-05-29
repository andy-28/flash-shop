using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Media.Commands;

public sealed class DeleteMediaCommand : IRequest
{
    public Guid Id { get; set; }
    public bool Force { get; set; }
}

public sealed class DeleteMediaCommandHandler(
    IMediaRepository mediaRepository,
    IMediaService mediaService,
    IUnitOfWork unitOfWork) : IRequestHandler<DeleteMediaCommand>
{
    public async Task Handle(DeleteMediaCommand request, CancellationToken cancellationToken)
    {
        var mediaFile = await mediaRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Media file was not found.");

        if (mediaFile.Usages.Count > 0 && !request.Force)
        {
            throw new BusinessException($"This media file is used by {mediaFile.Usages.Count} item(s). Use force=true to delete it.");
        }

        await mediaService.DeleteFileAsync(mediaFile.FilePath, mediaFile.ThumbnailPath, cancellationToken);
        mediaRepository.Remove(mediaFile);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
