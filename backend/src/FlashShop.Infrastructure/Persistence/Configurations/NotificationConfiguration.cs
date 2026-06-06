using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("notifications");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.UserId).HasColumnName("user_id");
        builder.Property(x => x.Type).HasColumnName("type").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Message).HasColumnName("message").HasMaxLength(1000).IsRequired();
        builder.Property(x => x.LinkUrl).HasColumnName("link_url").HasMaxLength(500);
        builder.Property(x => x.IsRead).HasColumnName("is_read");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");

        builder.HasIndex(x => new { x.UserId, x.IsRead, x.CreatedAt });
        builder.HasOne(x => x.User).WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
