using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Media.DTOs;
using MediatR;

namespace FlashShop.Application.Media.Queries;

public sealed class GetMediaListQuery : IRequest<MediaListDto>
{
    public string? Folder { get; set; }
    public string? Search { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 24;
}

public sealed class GetMediaListQueryHandler(IMediaRepository mediaRepository)
    : IRequestHandler<GetMediaListQuery, MediaListDto>
{
    public async Task<MediaListDto> Handle(GetMediaListQuery request, CancellationToken cancellationToken)
    {
        var page = Math.Max(request.Page, 1);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var items = await mediaRepository.ListAsync(request.Folder, request.Search, page, pageSize, cancellationToken);
        var total = await mediaRepository.CountAsync(request.Folder, request.Search, cancellationToken);

        return new MediaListDto(items.Select(MediaFileMapper.ToDto).ToList(), total, page, pageSize);
    }
}
