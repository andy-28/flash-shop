using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.ToTable("product_variants");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.ProductId).HasColumnName("product_id");
        builder.Property(x => x.Sku).HasColumnName("sku").HasMaxLength(50).IsRequired();
        builder.Property(x => x.SpecName).HasColumnName("spec_name").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Price).HasColumnName("price").HasPrecision(18, 2);
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(50).IsRequired();
        builder.Property(x => x.IsPreOrder).HasColumnName("is_pre_order").HasDefaultValue(false);
        builder.Property(x => x.EstimatedArrivalDate).HasColumnName("estimated_arrival_date");
        builder.Property(x => x.PreOrderCount).HasColumnName("pre_order_count").HasDefaultValue(0);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.HasIndex(x => x.Sku).IsUnique();
    }
}
