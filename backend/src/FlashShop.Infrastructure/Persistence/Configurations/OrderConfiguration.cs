using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.OrderNo).HasColumnName("order_no").HasMaxLength(30).IsRequired();
        builder.Property(x => x.OrderType).HasColumnName("order_type").HasMaxLength(20).HasDefaultValue("Normal").IsRequired();
        builder.Property(x => x.Status).HasColumnName("status").HasConversion<string>().IsRequired();
        builder.Property(x => x.TotalAmount).HasColumnName("total_amount").HasPrecision(18, 2);
        builder.Property(x => x.DiscountAmount).HasColumnName("discount_amount").HasPrecision(18, 2);
        builder.Property(x => x.ShippingFee).HasColumnName("shipping_fee").HasPrecision(18, 2);
        builder.Property(x => x.FinalAmount).HasColumnName("final_amount").HasPrecision(18, 2);
        builder.Property(x => x.CouponId).HasColumnName("coupon_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.Property(x => x.PaidAt).HasColumnName("paid_at");
        builder.Property(x => x.ExpiredAt).HasColumnName("expired_at").IsRequired();
        builder.HasIndex(x => x.OrderNo).IsUnique();
        builder.HasOne(x => x.User).WithMany(x => x.Orders).HasForeignKey(x => x.UserId);
        builder.HasOne(x => x.Coupon).WithMany(x => x.Orders).HasForeignKey(x => x.CouponId);
        builder.HasMany(x => x.Items).WithOne(x => x.Order).HasForeignKey(x => x.OrderId);
    }
}
