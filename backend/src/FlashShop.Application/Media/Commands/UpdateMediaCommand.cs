using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Media.DTOs;
using MediatR;

namespace FlashShop.Application.Media.Commands;

public sealed class UpdateMediaCommand : IRequest<MediaFileDto>
{
    public Guid Id { get; set; }
    public string? AltText { get; set; }
    public string? Folder { get; set; }
}

public sealed class UpdateMediaCommandHandler(IMediaRepository mediaRepository, IUnitOfWork unitOfWork)
    : IRequestHandler<UpdateMediaCommand, MediaFileDto>
{
    public async Task<MediaFileDto> Handle(UpdateMediaCommand request, CancellationToken cancellationToken)
    {
        var mediaFile = await mediaRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Media file was not found.");

        mediaFile.AltText = Normalize(request.AltText);
        mediaFile.Folder = Normalize(request.Folder);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return MediaFileMapper.ToDto(mediaFile);
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
