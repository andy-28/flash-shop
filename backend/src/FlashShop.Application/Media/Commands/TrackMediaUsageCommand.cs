using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Media.Commands;

public sealed class TrackMediaUsageCommand : IRequest
{
    public string FilePath { get; set; } = string.Empty;
    public string EntityType { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string FieldName { get; set; } = string.Empty;
}

public sealed class TrackMediaUsageCommandHandler(IMediaRepository mediaRepository, IUnitOfWork unitOfWork)
    : IRequestHandler<TrackMediaUsageCommand>
{
    public async Task Handle(TrackMediaUsageCommand request, CancellationToken cancellationToken)
    {
        await mediaRepository.TrackUsageByPathAsync(request.FilePath, request.EntityType, request.EntityId, request.FieldName, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
