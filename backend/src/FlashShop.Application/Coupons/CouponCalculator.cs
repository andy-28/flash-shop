using FlashShop.Application.Coupons.DTOs;
using FlashShop.Domain.Entities;

namespace FlashShop.Application.Coupons;

public static class CouponCalculator
{
    public static ApplyCouponResultDto Validate(Coupon? coupon, bool hasUsed, decimal orderAmount, DateTime now)
    {
        if (coupon is null)
        {
            return Invalid("優惠券不存在");
        }

        if (now < coupon.ValidFrom || now > coupon.ValidUntil)
        {
            return Invalid("優惠券已過期");
        }

        if (coupon.UsedCount >= coupon.UsageLimit)
        {
            return Invalid("優惠券已被領完");
        }

        if (orderAmount < coupon.MinOrderAmount)
        {
            return Invalid($"未達最低消費 {coupon.MinOrderAmount:N0} 元");
        }

        if (hasUsed)
        {
            return Invalid("您已使用過此優惠券");
        }

        var discountAmount = coupon.DiscountType switch
        {
            "Fixed" => coupon.DiscountValue,
            "Percentage" => orderAmount * (coupon.DiscountValue / 100m),
            _ => 0
        };
        discountAmount = Math.Min(orderAmount, Math.Max(0, decimal.Round(discountAmount, 2)));

        return new ApplyCouponResultDto(true, null, coupon.Id, coupon.Code, coupon.DiscountType, discountAmount);
    }

    private static ApplyCouponResultDto Invalid(string message)
    {
        return new ApplyCouponResultDto(false, message, null, null, null, 0);
    }
}
