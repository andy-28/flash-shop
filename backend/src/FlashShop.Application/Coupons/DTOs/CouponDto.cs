namespace FlashShop.Application.Coupons.DTOs;

public sealed record CouponDto(
    Guid Id,
    string Code,
    string DiscountType,
    decimal DiscountValue,
    decimal MinOrderAmount,
    int UsageLimit,
    int UsedCount,
    DateTime ValidFrom,
    DateTime ValidUntil,
    bool IsExpired,
    bool IsFullyUsed);
