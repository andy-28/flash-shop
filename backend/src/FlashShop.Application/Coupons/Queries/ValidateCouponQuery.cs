using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Coupons.DTOs;
using MediatR;

namespace FlashShop.Application.Coupons.Queries;

public sealed class ValidateCouponQuery : IRequest<ApplyCouponResultDto>
{
    public string Code { get; set; } = string.Empty;
    public decimal OrderAmount { get; set; }
    public Guid UserId { get; set; }
}

public sealed class ValidateCouponQueryHandler(ICouponRepository couponRepository)
    : IRequestHandler<ValidateCouponQuery, ApplyCouponResultDto>
{
    public async Task<ApplyCouponResultDto> Handle(ValidateCouponQuery request, CancellationToken cancellationToken)
    {
        var coupon = await couponRepository.GetByCodeAsync(request.Code, cancellationToken);
        var hasUsed = coupon is not null && await couponRepository.HasUsageAsync(coupon.Id, request.UserId, cancellationToken);
        return CouponCalculator.Validate(coupon, hasUsed, request.OrderAmount, DateTime.UtcNow);
    }
}
