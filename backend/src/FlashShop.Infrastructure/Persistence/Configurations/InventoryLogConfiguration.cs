using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class InventoryLogConfiguration : IEntityTypeConfiguration<InventoryLog>
{
    public void Configure(EntityTypeBuilder<InventoryLog> builder)
    {
        builder.ToTable("inventory_logs");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.InventoryId).HasColumnName("inventory_id");
        builder.Property(x => x.ChangeType).HasColumnName("change_type").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Quantity).HasColumnName("quantity");
        builder.Property(x => x.Reason).HasColumnName("reason").HasMaxLength(500).IsRequired();
        builder.Property(x => x.OrderId).HasColumnName("order_id");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at").IsRequired();
        builder.HasOne(x => x.Inventory).WithMany(x => x.Logs).HasForeignKey(x => x.InventoryId);
    }
}
