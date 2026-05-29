using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Commands;

public sealed class ArchiveContentBlockCommand : IRequest<ContentBlockDto>
{
    public Guid Id { get; set; }
}

public sealed class ArchiveContentBlockCommandHandler(
    IContentRepository contentRepository,
    IUnitOfWork unitOfWork,
    ICacheService cacheService) : IRequestHandler<ArchiveContentBlockCommand, ContentBlockDto>
{
    public async Task<ContentBlockDto> Handle(ArchiveContentBlockCommand request, CancellationToken cancellationToken)
    {
        var block = await contentRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Content block was not found.");

        block.Status = "Archived";
        block.IsActive = false;
        block.UpdatedAt = DateTime.UtcNow;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        await cacheService.RemoveAsync(CacheKeys.Content(block.Placement), cancellationToken);
        return ContentBlockMapper.ToDto(block);
    }
}
