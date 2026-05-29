using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Commands;

public sealed class PublishContentBlockCommand : IRequest<ContentBlockDto>
{
    public Guid Id { get; set; }
}

public sealed class PublishContentBlockCommandHandler(
    IContentRepository contentRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<PublishContentBlockCommand, ContentBlockDto>
{
    public async Task<ContentBlockDto> Handle(PublishContentBlockCommand request, CancellationToken cancellationToken)
    {
        var block = await contentRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Content block was not found.");

        if (block.Status == "Archived")
        {
            throw new BusinessException("Archived content must be restored before publishing.");
        }

        block.Status = "Published";
        block.IsActive = true;
        block.PublishedAt ??= DateTime.UtcNow;
        block.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveAsync(CacheKeys.Content(block.Placement), cancellationToken);
        return ContentBlockMapper.ToDto(block);
    }
}
