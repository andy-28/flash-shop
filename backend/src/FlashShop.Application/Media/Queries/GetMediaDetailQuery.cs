using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Media.DTOs;
using MediatR;

namespace FlashShop.Application.Media.Queries;

public sealed class GetMediaDetailQuery : IRequest<MediaFileDetailDto>
{
    public Guid Id { get; set; }
}

public sealed class GetMediaDetailQueryHandler(IMediaRepository mediaRepository)
    : IRequestHandler<GetMediaDetailQuery, MediaFileDetailDto>
{
    public async Task<MediaFileDetailDto> Handle(GetMediaDetailQuery request, CancellationToken cancellationToken)
    {
        var mediaFile = await mediaRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Media file was not found.");

        return MediaFileMapper.ToDetailDto(mediaFile);
    }
}
