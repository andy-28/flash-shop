using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Coupons.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/coupons")]
[Authorize]
public sealed class CouponController(IMediator mediator, ICurrentUserService currentUserService) : ApiControllerBase
{
    [HttpPost("validate")]
    public async Task<IActionResult> ValidateCoupon([FromBody] ValidateCouponRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ValidateCouponQuery
        {
            Code = request.Code,
            OrderAmount = request.OrderAmount,
            UserId = currentUserService.UserId ?? throw new UnauthorizedAccessException()
        }, cancellationToken);

        return OkResponse(result);
    }
}

public sealed class ValidateCouponRequest
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderAmount { get; set; }
}
