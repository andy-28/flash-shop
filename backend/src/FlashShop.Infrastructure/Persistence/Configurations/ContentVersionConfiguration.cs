using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class ContentVersionConfiguration : IEntityTypeConfiguration<ContentVersion>
{
    public void Configure(EntityTypeBuilder<ContentVersion> builder)
    {
        builder.ToTable("content_versions");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.ContentBlockId).HasColumnName("content_block_id");
        builder.Property(x => x.VersionNumber).HasColumnName("version_number");
        builder.Property(x => x.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Subtitle).HasColumnName("subtitle").HasMaxLength(200);
        builder.Property(x => x.Body).HasColumnName("body");
        builder.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(500).IsRequired();
        builder.Property(x => x.LinkUrl).HasColumnName("link_url").HasMaxLength(500);
        builder.Property(x => x.LinkType).HasColumnName("link_type").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Placement).HasColumnName("placement").HasMaxLength(50).IsRequired();
        builder.Property(x => x.IsActive).HasColumnName("is_active");
        builder.Property(x => x.StartAt).HasColumnName("start_at");
        builder.Property(x => x.EndAt).HasColumnName("end_at");
        builder.Property(x => x.ModifiedBy).HasColumnName("modified_by");
        builder.Property(x => x.ChangeNote).HasColumnName("change_note").HasMaxLength(500);
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");

        builder.HasIndex(x => new { x.ContentBlockId, x.VersionNumber }).IsUnique();

        builder.HasOne(x => x.ModifiedByUser)
            .WithMany()
            .HasForeignKey(x => x.ModifiedBy)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
