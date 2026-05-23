using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Queries;

public sealed class GetAdminContentListQuery : IRequest<IReadOnlyCollection<ContentBlockDto>>
{
    public string? Placement { get; set; }
}

public sealed class GetAdminContentListQueryHandler(IContentRepository contentRepository)
    : IRequestHandler<GetAdminContentListQuery, IReadOnlyCollection<ContentBlockDto>>
{
    public async Task<IReadOnlyCollection<ContentBlockDto>> Handle(GetAdminContentListQuery request, CancellationToken cancellationToken)
    {
        var placement = string.IsNullOrWhiteSpace(request.Placement) ? null : request.Placement.Trim();
        var blocks = await contentRepository.ListAdminAsync(placement, cancellationToken);
        return blocks.Select(ContentBlockMapper.ToDto).ToList();
    }
}
