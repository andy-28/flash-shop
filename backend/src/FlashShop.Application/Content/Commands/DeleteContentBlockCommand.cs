using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Content.Commands;

public sealed class DeleteContentBlockCommand : IRequest
{
    public Guid Id { get; set; }
}

public sealed class DeleteContentBlockCommandHandler(
    IContentRepository contentRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService,
    IMediaRepository mediaRepository) : IRequestHandler<DeleteContentBlockCommand>
{
    public async Task Handle(DeleteContentBlockCommand request, CancellationToken cancellationToken)
    {
        var block = await contentRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Content block was not found.");

        var placement = block.Placement;
        await mediaRepository.ClearUsageAsync("ContentBlock", block.Id, "ImageUrl", cancellationToken);
        contentRepository.Remove(block);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveAsync(CacheKeys.Content(placement), cancellationToken);
    }
}
