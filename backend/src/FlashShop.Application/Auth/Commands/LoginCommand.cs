using FlashShop.Application.Auth.DTOs;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Auth.Commands;

public sealed class LoginCommand : IRequest<LoginResponse>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public sealed class LoginCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService) : IRequestHandler<LoginCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var user = await userRepository.GetByEmailAsync(email, cancellationToken);
        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new BusinessException("Invalid email or password.");
        }

        return jwtTokenService.CreateLoginResponse(user);
    }
}
