using FlashShop.Application.Common.Interfaces;
using FlashShop.Application.Coupons.DTOs;
using MediatR;

namespace FlashShop.Application.Coupons.Queries;

public sealed class GetCouponListQuery : IRequest<IReadOnlyCollection<CouponDto>>
{
}

public sealed class GetCouponListQueryHandler(ICouponRepository couponRepository)
    : IRequestHandler<GetCouponListQuery, IReadOnlyCollection<CouponDto>>
{
    public async Task<IReadOnlyCollection<CouponDto>> Handle(GetCouponListQuery request, CancellationToken cancellationToken)
    {
        var coupons = await couponRepository.ListAsync(cancellationToken);
        return coupons.Select(CouponMapper.ToDto).ToList();
    }
}
