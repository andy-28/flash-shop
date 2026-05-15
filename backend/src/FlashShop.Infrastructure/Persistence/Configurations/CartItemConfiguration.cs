using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.ToTable("cart_items");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.CartId).HasColumnName("cart_id");
        builder.Property(x => x.VariantId).HasColumnName("variant_id");
        builder.Property(x => x.Quantity).HasColumnName("quantity");
        builder.Property(x => x.AddedAt).HasColumnName("added_at").IsRequired();
        builder.HasOne(x => x.Variant).WithMany(x => x.CartItems).HasForeignKey(x => x.VariantId);
    }
}
