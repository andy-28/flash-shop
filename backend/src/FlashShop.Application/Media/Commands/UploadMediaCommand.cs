using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Media.DTOs;
using MediatR;

namespace FlashShop.Application.Media.Commands;

public sealed class UploadMediaCommand : IRequest<MediaFileDto>
{
    public Stream FileStream { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public string? Folder { get; set; }
    public string? AltText { get; set; }
    public Guid UploadedBy { get; set; }
}

public sealed class UploadMediaCommandHandler(
    IMediaService mediaService,
    IMediaRepository mediaRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<UploadMediaCommand, MediaFileDto>
{
    public async Task<MediaFileDto> Handle(UploadMediaCommand request, CancellationToken cancellationToken)
    {
        if (request.UploadedBy == Guid.Empty)
        {
            throw new BusinessException("Current user is required.");
        }

        var mediaFile = await mediaService.UploadAsync(
            request.FileStream,
            request.FileName,
            request.MimeType,
            Normalize(request.Folder),
            request.UploadedBy,
            cancellationToken);

        mediaFile.AltText = Normalize(request.AltText);
        await mediaRepository.AddAsync(mediaFile, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return MediaFileMapper.ToDto(mediaFile);
    }

    private static string? Normalize(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }
}
