using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Common.Models;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Queries;

public sealed class GetContentsFeedQuery : IRequest<PagedResult<ContentFeedDto>>
{
    public string? Category { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}

public sealed class GetContentsFeedQueryHandler(IContentRepository contentRepository)
    : IRequestHandler<GetContentsFeedQuery, PagedResult<ContentFeedDto>>
{
    public async Task<PagedResult<ContentFeedDto>> Handle(GetContentsFeedQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(request.Page, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 48);
        var category = string.IsNullOrWhiteSpace(request.Category) || request.Category == "All"
            ? null
            : request.Category.Trim();

        var (items, totalCount) = await contentRepository.ListPublicFeedAsync(category, page, pageSize, DateTime.UtcNow, cancellationToken);
        return new PagedResult<ContentFeedDto>(items.Select(ContentBlockMapper.ToFeedDto).ToList(), totalCount, page, pageSize);
    }
}

public sealed class GetContentDetailQuery : IRequest<ContentDetailDto>
{
    public Guid Id { get; set; }
}

public sealed class GetContentDetailQueryHandler(
    IContentRepository contentRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<GetContentDetailQuery, ContentDetailDto>
{
    public async Task<ContentDetailDto> Handle(GetContentDetailQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var block = await contentRepository.GetPublicFeedDetailAsync(request.Id, now, cancellationToken)
            ?? throw new NotFoundException("Content was not found.");

        block.ViewCount += 1;
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var related = await contentRepository.ListRelatedFeedAsync(block.Id, block.Category, now, 3, cancellationToken);
        return ContentBlockMapper.ToDetailDto(block, related);
    }
}
