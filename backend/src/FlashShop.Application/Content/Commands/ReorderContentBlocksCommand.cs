using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Content.Commands;

public sealed class ReorderContentBlocksCommand : IRequest
{
    public string Placement { get; set; } = string.Empty;
    public List<Guid> OrderedIds { get; set; } = new();
}

public sealed class ReorderContentBlocksCommandHandler(
    IContentRepository contentRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<ReorderContentBlocksCommand>
{
    public async Task Handle(ReorderContentBlocksCommand request, CancellationToken cancellationToken)
    {
        var placement = request.Placement.Trim();
        if (string.IsNullOrWhiteSpace(placement))
        {
            throw new BusinessException("Placement is required.");
        }

        var blocks = await contentRepository.ListByPlacementAsync(placement, cancellationToken);
        var byId = blocks.ToDictionary(block => block.Id);

        for (var index = 0; index < request.OrderedIds.Count; index++)
        {
            var id = request.OrderedIds[index];
            if (!byId.TryGetValue(id, out var block))
            {
                continue;
            }

            block.Position = index;
            block.UpdatedAt = DateTime.UtcNow;
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
