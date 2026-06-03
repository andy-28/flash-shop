using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FlashShop.Infrastructure.Persistence.Configurations;

public sealed class PostCommentConfiguration : IEntityTypeConfiguration<PostComment>
{
    public void Configure(EntityTypeBuilder<PostComment> builder)
    {
        builder.ToTable("post_comments");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Id).HasColumnName("id");
        builder.Property(x => x.PostId).HasColumnName("post_id");
        builder.Property(x => x.AuthorId).HasColumnName("author_id");
        builder.Property(x => x.ParentCommentId).HasColumnName("parent_comment_id");
        builder.Property(x => x.Content).HasColumnName("content").HasMaxLength(2000).IsRequired();
        builder.Property(x => x.IsHidden).HasColumnName("is_hidden");
        builder.Property(x => x.LikeCount).HasColumnName("like_count");
        builder.Property(x => x.CreatedAt).HasColumnName("created_at");

        builder.HasIndex(x => x.PostId);
        builder.HasOne(x => x.Author).WithMany().HasForeignKey(x => x.AuthorId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(x => x.ParentComment).WithMany(x => x.Replies).HasForeignKey(x => x.ParentCommentId).OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(x => x.Likes).WithOne(x => x.Comment).HasForeignKey(x => x.CommentId).OnDelete(DeleteBehavior.Cascade);
    }
}
