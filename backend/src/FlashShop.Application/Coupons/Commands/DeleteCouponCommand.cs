using FlashShop.Application.Common.Exceptions;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Coupons.Commands;

public sealed class DeleteCouponCommand : IRequest
{
    public Guid Id { get; set; }
}

public sealed class DeleteCouponCommandHandler(
    ICouponRepository couponRepository,
    IUnitOfWork unitOfWork) : IRequestHandler<DeleteCouponCommand>
{
    public async Task Handle(DeleteCouponCommand request, CancellationToken cancellationToken)
    {
        var coupon = await couponRepository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new NotFoundException("Coupon was not found.");

        if (await couponRepository.HasAnyUsageAsync(coupon.Id, cancellationToken))
        {
            throw new BusinessException("Coupon has usage records and cannot be deleted.");
        }

        couponRepository.Remove(coupon);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
