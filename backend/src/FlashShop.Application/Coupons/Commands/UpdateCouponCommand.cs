using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Coupons.DTOs;
using MediatR;

namespace FlashShop.Application.Coupons.Commands;

public sealed class UpdateCouponCommand : IRequest<CouponDto>
{
    public Guid Id { get; set; }
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int UsageLimit { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }
}

public sealed class UpdateCouponCommandHandler(
    ICouponRepository couponRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<UpdateCouponCommand, CouponDto>
{
    public async Task<CouponDto> Handle(UpdateCouponCommand request, CancellationToken cancellationToken)
    {
        var coupon = await couponRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Coupon was not found.");

        CreateCouponCommandHandler.ValidateCouponInput(
            coupon.Code,
            coupon.DiscountType,
            request.DiscountValue,
            request.UsageLimit,
            request.ValidFrom,
            request.ValidUntil);

        coupon.DiscountValue = request.DiscountValue;
        coupon.MinOrderAmount = request.MinOrderAmount;
        coupon.UsageLimit = request.UsageLimit;
        coupon.ValidFrom = request.ValidFrom;
        coupon.ValidUntil = request.ValidUntil;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return CouponMapper.ToDto(coupon);
    }
}
