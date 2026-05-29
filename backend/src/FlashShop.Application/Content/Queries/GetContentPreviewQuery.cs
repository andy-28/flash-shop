using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Content.DTOs;
using MediatR;

namespace FlashShop.Application.Content.Queries;

public sealed class GetContentPreviewQuery : IRequest<ContentBlockDto>
{
    public Guid Id { get; set; }
}

public sealed class GetContentPreviewQueryHandler(IContentRepository contentRepository) : IRequestHandler<GetContentPreviewQuery, ContentBlockDto>
{
    public async Task<ContentBlockDto> Handle(GetContentPreviewQuery request, CancellationToken cancellationToken)
    {
        var block = await contentRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Content block was not found.");
        return ContentBlockMapper.ToDto(block);
    }
}
