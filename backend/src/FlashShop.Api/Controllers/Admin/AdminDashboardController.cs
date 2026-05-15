using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/dashboard")]
public sealed class AdminDashboardController : ControllerBase
{
    [HttpGet("summary")]
    public IActionResult GetSummary() => Ok("TODO");
}
