using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class ShipmentConfiguration : IEntityTypeConfiguration<Shipment>
{
    public void Configure(EntityTypeBuilder<Shipment> builder)
    {
        builder.ToTable("shipments");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.OrderId).HasColumnName("order_id");
        builder.Property(x => x.Carrier).HasColumnName("carrier").HasMaxLength(100).IsRequired();
        builder.Property(x => x.TrackingNo).HasColumnName("tracking_no").HasMaxLength(100);
        builder.Property(x => x.Status).HasColumnName("status").HasConversion<string>().IsRequired();
        builder.Property(x => x.ShippedAt).HasColumnName("shipped_at");
        builder.Property(x => x.DeliveredAt).HasColumnName("delivered_at");
        builder.HasIndex(x => x.OrderId).IsUnique();
        builder.HasOne(x => x.Order).WithOne(x => x.Shipment).HasForeignKey<Shipment>(x => x.OrderId);
    }
}
