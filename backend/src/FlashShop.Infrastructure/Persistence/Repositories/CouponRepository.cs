using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Infrastructure.Persistence.Repositories;

public sealed class CouponRepository(AppDbContext dbContext) : ICouponRepository
{
    public Task<Coupon?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return dbContext.Coupons.FirstOrDefaultAsync(coupon => coupon.Id == id, cancellationToken);
    }

    public Task<Coupon?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalizedCode = code.Trim().ToUpperInvariant();
        return dbContext.Coupons.FirstOrDefaultAsync(coupon => coupon.Code == normalizedCode, cancellationToken);
    }

    public async Task<IReadOnlyCollection<Coupon>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Coupons
            .AsNoTracking()
            .OrderByDescending(coupon => coupon.ValidUntil)
            .ToListAsync(cancellationToken);
    }

    public Task<bool> HasUsageAsync(Guid couponId, Guid userId, CancellationToken cancellationToken = default)
    {
        return dbContext.CouponUsages.AnyAsync(usage => usage.CouponId == couponId && usage.UserId == userId, cancellationToken);
    }

    public Task<bool> HasAnyUsageAsync(Guid couponId, CancellationToken cancellationToken = default)
    {
        return dbContext.CouponUsages.AnyAsync(usage => usage.CouponId == couponId, cancellationToken);
    }

    public Task AddAsync(Coupon coupon, CancellationToken cancellationToken = default)
    {
        return dbContext.Coupons.AddAsync(coupon, cancellationToken).AsTask();
    }

    public Task AddUsageAsync(CouponUsage usage, CancellationToken cancellationToken = default)
    {
        return dbContext.CouponUsages.AddAsync(usage, cancellationToken).AsTask();
    }

    public void Remove(Coupon coupon)
    {
        dbContext.Coupons.Remove(coupon);
    }
}
