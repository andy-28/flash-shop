using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class CommunityPostConfiguration : IEntityTypeConfiguration<CommunityPost>
{
    public void Configure(EntityTypeBuilder<CommunityPost> builder)
    {
        builder.ToTable("community_posts");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.AuthorId).HasColumnName("author_id");
        builder.Property(x => x.Category).HasColumnName("category").HasMaxLength(50).IsRequired();
        builder.Property(x => x.Title).HasColumnName("title").HasMaxLength(200).IsRequired();
        builder.Property(x => x.Content).HasColumnName("content").IsRequired();
        builder.Property(x => x.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
        builder.Property(x => x.IsPinned).HasColumnName("is_pinned");
        builder.Property(x => x.IsHidden).HasColumnName("is_hidden");
        builder.Property(x => x.LikeCount).HasColumnName("like_count");
        builder.Property(x => x.CommentCount).HasColumnName("comment_count");
        builder.Property(x => x.ViewCount).HasColumnName("view_count");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");
        builder.Property(x => x.UpdatedAt).HasColumnName("updated_at");

        builder.HasIndex(x => x.Category);
        builder.HasIndex(x => x.CreatedAt);
        builder.HasIndex(x => new { x.IsPinned, x.CreatedAt });

        builder.HasOne(x => x.Author).WithMany().HasForeignKey(x => x.AuthorId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(x => x.Comments).WithOne(x => x.Post).HasForeignKey(x => x.PostId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(x => x.Likes).WithOne(x => x.Post).HasForeignKey(x => x.PostId).OnDelete(DeleteBehavior.Cascade);
    }
}
