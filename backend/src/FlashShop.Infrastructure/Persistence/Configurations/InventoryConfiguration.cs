using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class InventoryConfiguration : IEntityTypeConfiguration<Inventory>
{
    public void Configure(EntityTypeBuilder<Inventory> builder)
    {
        builder.ToTable("inventories");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.VariantId).HasColumnName("variant_id");
        builder.Property(x => x.TotalStock).HasColumnName("total_stock");
        builder.Property(x => x.AvailableStock).HasColumnName("available_stock");
        builder.Property(x => x.FrozenStock).HasColumnName("frozen_stock");
        builder.Property(x => x.SoldCount).HasColumnName("sold_count");
        builder.Property(x => x.Version).HasColumnName("version").IsConcurrencyToken();
        builder.HasIndex(x => x.VariantId).IsUnique();
        builder.HasOne(x => x.Variant).WithOne(x => x.Inventory).HasForeignKey<Inventory>(x => x.VariantId);
    }
}
