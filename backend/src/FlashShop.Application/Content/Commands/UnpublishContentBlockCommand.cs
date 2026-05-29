using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Commands;

public sealed class UnpublishContentBlockCommand : IRequest<ContentBlockDto>
{
    public Guid Id { get; set; }
}

public sealed class UnpublishContentBlockCommandHandler(
    IContentRepository contentRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<UnpublishContentBlockCommand, ContentBlockDto>
{
    public async Task<ContentBlockDto> Handle(UnpublishContentBlockCommand request, CancellationToken cancellationToken)
    {
        var block = await contentRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Content block was not found.");

        block.Status = "Draft";
        block.IsActive = false;
        block.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveAsync(CacheKeys.Content(block.Placement), cancellationToken);
        return ContentBlockMapper.ToDto(block);
    }
}
