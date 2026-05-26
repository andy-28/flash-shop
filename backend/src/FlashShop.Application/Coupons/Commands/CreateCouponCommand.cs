using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Coupons.DTOs;
using FlashShop.Domain.Entities;
using MediatR;

namespace FlashShop.Application.Coupons.Commands;

public sealed class CreateCouponCommand : IRequest<CouponDto>
{
    public string Code { get; set; } = string.Empty;
    public string DiscountType { get; set; } = "Fixed";
    public decimal DiscountValue { get; set; }
    public decimal MinOrderAmount { get; set; }
    public int UsageLimit { get; set; }
    public DateTime ValidFrom { get; set; }
    public DateTime ValidUntil { get; set; }
}

public sealed class CreateCouponCommandHandler(
    ICouponRepository couponRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<CreateCouponCommand, CouponDto>
{
    public async Task<CouponDto> Handle(CreateCouponCommand request, CancellationToken cancellationToken)
    {
        var code = request.Code.Trim().ToUpperInvariant();
        ValidateCouponInput(code, request.DiscountType, request.DiscountValue, request.UsageLimit, request.ValidFrom, request.ValidUntil);

        if (await couponRepository.GetByCodeAsync(code, cancellationToken) is not null)
        {
            throw new BusinessException("Coupon code already exists.");
        }

        var coupon = new Coupon
        {
            Id = Guid.NewGuid(),
            Code = code,
            DiscountType = request.DiscountType,
            DiscountValue = request.DiscountValue,
            MinOrderAmount = request.MinOrderAmount,
            UsageLimit = request.UsageLimit,
            UsedCount = 0,
            ValidFrom = request.ValidFrom,
            ValidUntil = request.ValidUntil
        };

        await couponRepository.AddAsync(coupon, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);
        return CouponMapper.ToDto(coupon);
    }

    internal static void ValidateCouponInput(string code, string discountType, decimal discountValue, int usageLimit, DateTime validFrom, DateTime validUntil)
    {
        if (string.IsNullOrWhiteSpace(code))
        {
            throw new BusinessException("Coupon code is required.");
        }

        if (discountType is not ("Fixed" or "Percentage"))
        {
            throw new BusinessException("Discount type must be Fixed or Percentage.");
        }

        if (discountValue <= 0 || discountType == "Percentage" && discountValue > 100)
        {
            throw new BusinessException("Discount value is invalid.");
        }

        if (usageLimit <= 0)
        {
            throw new BusinessException("Usage limit must be greater than zero.");
        }

        if (validUntil <= validFrom)
        {
            throw new BusinessException("Valid until must be later than valid from.");
        }
    }
}
