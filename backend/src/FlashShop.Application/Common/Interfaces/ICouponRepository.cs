using FlashShop.Domain.Entities;

namespace FlashShop.Application.Common.Interfaces;

public interface ICouponRepository
{
    Task<Coupon?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Coupon?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Coupon>> ListAsync(CancellationToken cancellationToken = default);
    Task<bool> HasUsageAsync(Guid couponId, Guid userId, CancellationToken cancellationToken = default);
    Task<bool> HasAnyUsageAsync(Guid couponId, CancellationToken cancellationToken = default);
    Task AddAsync(Coupon coupon, CancellationToken cancellationToken = default);
    Task AddUsageAsync(CouponUsage usage, CancellationToken cancellationToken = default);
    void Remove(Coupon coupon);
}
