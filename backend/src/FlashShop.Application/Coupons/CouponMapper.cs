using FlashShop.Application.Coupons.DTOs;
using FlashShop.Domain.Entities;

namespace FlashShop.Application.Coupons;

public static class CouponMapper
{
    public static CouponDto ToDto(Coupon coupon)
    {
        var now = DateTime.UtcNow;
        return new CouponDto(
            coupon.Id,
            coupon.Code,
            coupon.DiscountType,
            coupon.DiscountValue,
            coupon.MinOrderAmount,
            coupon.UsageLimit,
            coupon.UsedCount,
            coupon.ValidFrom,
            coupon.ValidUntil,
            coupon.ValidUntil < now,
            coupon.UsedCount >= coupon.UsageLimit);
    }
}
