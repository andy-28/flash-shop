using FlashShop.Application.Common;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Queries;

public sealed class GetContentByPlacementQuery : IRequest<IReadOnlyCollection<ContentBlockDto>>
{
    public string Placement { get; set; } = string.Empty;
}

public sealed class GetContentByPlacementQueryHandler(
    IContentRepository contentRepository,
    ICacheService cacheService,
    ICacheStatusService cacheStatusService)
    : IRequestHandler<GetContentByPlacementQuery, IReadOnlyCollection<ContentBlockDto>>
{
    public async Task<IReadOnlyCollection<ContentBlockDto>> Handle(GetContentByPlacementQuery request, CancellationToken cancellationToken)
    {
        var placement = request.Placement.Trim();
        if (string.IsNullOrWhiteSpace(placement))
        {
            throw new BusinessException("Placement is required.");
        }

        var cacheKey = CacheKeys.Content(placement);
        var cached = await cacheService.GetAsync<List<ContentBlockDto>>(cacheKey, cancellationToken);
        if (cached is not null)
        {
            cacheStatusService.SetHit();
            return cached;
        }

        var blocks = await contentRepository.ListPublicByPlacementAsync(placement, DateTime.UtcNow, cancellationToken);
        var result = blocks.Select(ContentBlockMapper.ToDto).ToList();

        await cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5), cancellationToken);
        cacheStatusService.SetMiss();
        return result;
    }
}
