using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FlashShop.Application.Auth.DTOs;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using Microsoft.IdentityModel.Tokens;

namespace FlashShop.Api.Services;

public sealed class JwtTokenService(IConfiguration configuration) : IJwtTokenService
{
    public LoginResponse CreateLoginResponse(User user)
    {
        var expiresAt = DateTime.UtcNow.AddMinutes(
            configuration.GetValue<int?>("Jwt:ExpirationMinutes") ?? 60);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var secret = configuration["Jwt:Secret"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            throw new InvalidOperationException("Jwt:Secret is required.");
        }

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: configuration["Jwt:Issuer"],
            audience: configuration["Jwt:Audience"],
            claims: claims,
            expires: expiresAt,
            signingCredentials: credentials);

        return new LoginResponse
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt,
            User = new AuthUserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name,
                DisplayName = user.DisplayName,
                AvatarUrl = user.AvatarUrl,
                Bio = user.Bio,
                Role = user.Role.ToString()
            }
        };
    }
}
