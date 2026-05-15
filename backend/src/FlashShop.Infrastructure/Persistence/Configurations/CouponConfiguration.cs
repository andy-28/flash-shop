using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.ToTable("coupons");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Code).HasColumnName("code").HasMaxLength(50).IsRequired();
        builder.Property(x => x.DiscountType).HasColumnName("discount_type").HasMaxLength(50).IsRequired();
        builder.Property(x => x.DiscountValue).HasColumnName("discount_value").HasPrecision(18, 2);
        builder.Property(x => x.MinOrderAmount).HasColumnName("min_order_amount").HasPrecision(18, 2);
        builder.Property(x => x.UsageLimit).HasColumnName("usage_limit");
        builder.Property(x => x.UsedCount).HasColumnName("used_count");
        builder.Property(x => x.ValidFrom).HasColumnName("valid_from").IsRequired();
        builder.Property(x => x.ValidUntil).HasColumnName("valid_until").IsRequired();
        builder.HasIndex(x => x.Code).IsUnique();
    }
}
