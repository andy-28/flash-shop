using FlashShop.Application.Coupons.Commands;
using FlashShop.Application.Coupons.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/coupons")]
[Authorize(Roles = "Admin")]
public sealed class AdminCouponController(IMediator mediator) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetCoupons(CancellationToken cancellationToken)
    {
        var coupons = await mediator.Send(new GetCouponListQuery(), cancellationToken);
        return OkResponse(coupons);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCoupon([FromBody] CreateCouponCommand command, CancellationToken cancellationToken)
    {
        var coupon = await mediator.Send(command, cancellationToken);
        return OkResponse(coupon);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateCoupon(Guid id, [FromBody] UpdateCouponCommand command, CancellationToken cancellationToken)
    {
        command.Id = id;
        var coupon = await mediator.Send(command, cancellationToken);
        return OkResponse(coupon);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteCoupon(Guid id, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteCouponCommand { Id = id }, cancellationToken);
        return OkMessage("Operation completed successfully.");
    }
}
