using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Queries;

public sealed class GetContentVersionsQuery : IRequest<IReadOnlyCollection<ContentVersionDto>>
{
    public Guid ContentBlockId { get; set; }
}

public sealed class GetContentVersionsQueryHandler(IContentRepository contentRepository)
    : IRequestHandler<GetContentVersionsQuery, IReadOnlyCollection<ContentVersionDto>>
{
    public async Task<IReadOnlyCollection<ContentVersionDto>> Handle(GetContentVersionsQuery request, CancellationToken cancellationToken)
    {
        var block = await contentRepository.GetByIdAsync(request.ContentBlockId, cancellationToken)
            ?? throw new NotFoundException("Content block was not found.");
        var versions = await contentRepository.ListVersionsAsync(block.Id, cancellationToken);
        return versions.Select(ContentBlockMapper.ToVersionDto).ToList();
    }
}
