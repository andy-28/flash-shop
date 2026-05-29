using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class ContentBlockConfiguration : IEntityTypeConfiguration<ContentBlock>
{
    public void Configure(EntityTypeBuilder<ContentBlock> builder)
    {
        builder.ToTable("content_blocks");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Subtitle).HasColumnName("subtitle").HasMaxLength(200);
        builder.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(500).IsRequired();
        builder.Property(x => x.LinkUrl).HasColumnName("link_url").HasMaxLength(500);
        builder.Property(x => x.LinkType).HasColumnName("link_type").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Placement).HasColumnName("placement").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Status).HasColumnName("status").HasMaxLength(20).IsRequired().HasDefaultValue("Draft");
        builder.Property(x => x.Body).HasColumnName("body");
        builder.Property(x => x.Slug).HasColumnName("slug").HasMaxLength(200);
        builder.Property(x => x.Position).HasColumnName("position");
        builder.Property(x => x.IsActive).HasColumnName("is_active");
        builder.Property(x => x.StartAt).HasColumnName("start_at");
        builder.Property(x => x.EndAt).HasColumnName("end_at");
        builder.Property(x => x.PublishedAt).HasColumnName("published_at");
        builder.Property(x => x.Version).HasColumnName("version").HasDefaultValue(1);
        builder.Property(x => x.CreatedBy).HasColumnName("created_by");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.Placement);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.Slug).IsUnique().HasFilter("slug IS NOT NULL");
        builder.HasIndex(x => new { x.Placement, x.IsActive, x.Position });

        builder.HasOne(x => x.CreatedByUser)
            .WithMany()
            .HasForeignKey(x => x.CreatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Media)
            .WithOne(x => x.ContentBlock)
            .HasForeignKey(x => x.ContentBlockId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.Versions)
            .WithOne(x => x.ContentBlock)
            .HasForeignKey(x => x.ContentBlockId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
