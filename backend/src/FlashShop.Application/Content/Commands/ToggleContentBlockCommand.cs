using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Commands;

public sealed class ToggleContentBlockCommand : IRequest<ContentBlockDto>
{
    public Guid Id { get; set; }
}

public sealed class ToggleContentBlockCommandHandler(
    IContentRepository contentRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<ToggleContentBlockCommand, ContentBlockDto>
{
    public async Task<ContentBlockDto> Handle(ToggleContentBlockCommand request, CancellationToken cancellationToken)
    {
        var block = await contentRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Content block was not found.");

        block.IsActive = !block.IsActive;
        block.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveAsync(CacheKeys.Content(block.Placement), cancellationToken);
        return ContentBlockMapper.ToDto(block);
    }
}
