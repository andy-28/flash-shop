namespace FlashShop.Application.Coupons.DTOs;

public sealed record ApplyCouponResultDto(
    bool IsValid,
    string? ErrorMessage,
    Guid? CouponId,
    string? Code,
    string? DiscountType,
    decimal DiscountAmount);
