using FlashShop.Application.Auth.DTOs;
using FlashShop.Domain.Entities;

namespace FlashShop.Application.Common.Interfaces;

public interface IJwtTokenService
{
    LoginResponse CreateLoginResponse(User user);
}
