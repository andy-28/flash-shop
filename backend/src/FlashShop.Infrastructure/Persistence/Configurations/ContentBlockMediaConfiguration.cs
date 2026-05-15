using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class ContentBlockMediaConfiguration : IEntityTypeConfiguration<ContentBlockMedia>
{
    public void Configure(EntityTypeBuilder<ContentBlockMedia> builder)
    {
        builder.ToTable("content_block_media");

        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.ContentBlockId).HasColumnName("content_block_id");
        builder.Property(x => x.MediaType).HasColumnName("media_type").HasMaxLength(20).IsRequired();
        builder.Property(x => x.MediaUrl).HasColumnName("media_url").HasMaxLength(500).IsRequired();
        builder.Property(x => x.Position).HasColumnName("position");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
    }
}
