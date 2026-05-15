using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    [HttpPost("register")]
    public IActionResult Register() => Ok("TODO");

    [HttpPost("login")]
    public IActionResult Login() => Ok("TODO");
}
