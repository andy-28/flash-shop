using FlashShop.Application.Auth.DTOs;
using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using MediatR;

namespace FlashShop.Application.Auth.Commands;

public sealed class RegisterCommand : IRequest<LoginResponse>
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}

public sealed class RegisterCommandHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IJwtTokenService jwtTokenService,
    IUnitOfWork unitOfWork) : IRequestHandler<RegisterCommand, LoginResponse>
{
    public async Task<LoginResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var email = request.Email.Trim().ToLowerInvariant();
        var existingUser = await userRepository.GetByEmailAsync(email, cancellationToken);
        if (existingUser is not null)
        {
            throw new BusinessException("Email is already registered.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Name = request.Name.Trim(),
            PasswordHash = passwordHasher.Hash(request.Password),
            Role = UserRole.Customer,
            CreatedAt = DateTime.UtcNow
        };

        await userRepository.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return jwtTokenService.CreateLoginResponse(user);
    }
}
