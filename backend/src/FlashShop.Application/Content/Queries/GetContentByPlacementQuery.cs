using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Queries;

public sealed class GetContentByPlacementQuery : IRequest<IReadOnlyCollection<ContentBlockDto>>
{
    public string Placement { get; set; } = string.Empty;
}

public sealed class GetContentByPlacementQueryHandler(IContentRepository contentRepository)
    : IRequestHandler<GetContentByPlacementQuery, IReadOnlyCollection<ContentBlockDto>>
{
    public async Task<IReadOnlyCollection<ContentBlockDto>> Handle(GetContentByPlacementQuery request, CancellationToken cancellationToken)
    {
        var placement = request.Placement.Trim();
        if (string.IsNullOrWhiteSpace(placement))
        {
            throw new BusinessException("Placement is required.");
        }

        var blocks = await contentRepository.ListPublicByPlacementAsync(placement, DateTime.UtcNow, cancellationToken);
        return blocks.Select(ContentBlockMapper.ToDto).ToList();
    }
}
