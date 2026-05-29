using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Media.Queries;

public sealed class GetMediaFoldersQuery : IRequest<IReadOnlyCollection<string>>;

public sealed class GetMediaFoldersQueryHandler(IMediaRepository mediaRepository)
    : IRequestHandler<GetMediaFoldersQuery, IReadOnlyCollection<string>>
{
    public Task<IReadOnlyCollection<string>> Handle(GetMediaFoldersQuery request, CancellationToken cancellationToken)
    {
        return mediaRepository.GetFoldersAsync(cancellationToken);
    }
}
