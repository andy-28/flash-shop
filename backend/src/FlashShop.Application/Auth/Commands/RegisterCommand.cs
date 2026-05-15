using FlashShop.Application.Auth.DTOs;
using MediatR;

namespace FlashShop.Application.Auth.Commands;

public sealed class RegisterCommand : IRequest<LoginResponse>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, LoginResponse>
{
    public Task<LoginResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}
