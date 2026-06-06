using FlashShop.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/community")]
[Authorize(Roles = "Admin")]
public sealed class AdminCommunityController(AppDbContext dbContext) : ApiControllerBase
{
    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts(CancellationToken cancellationToken)
    {
        var posts = await dbContext.CommunityPosts
            .Include(post => post.Author)
            .AsNoTracking()
            .OrderByDescending(post => post.IsPinned)
            .ThenByDescending(post => post.CreatedAt)
            .Select(post => new AdminCommunityPostDto(post.Id, post.Title, post.Author.Name, post.Category, post.LikeCount, post.CommentCount, post.IsPinned, post.IsHidden, post.CreatedAt))
            .ToListAsync(cancellationToken);
        return OkResponse(posts);
    }

    [HttpPost("posts/{id:guid}/pin")]
    public async Task<IActionResult> TogglePin(Guid id, CancellationToken cancellationToken)
    {
        var post = await dbContext.CommunityPosts.FirstOrDefaultAsync(post => post.Id == id, cancellationToken);
        if (post is null) throw new NotFoundException("Resource was not found.");
        post.IsPinned = !post.IsPinned;
        post.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return OkResponse(new { post.IsPinned });
    }

    [HttpDelete("posts/{id:guid}")]
    public async Task<IActionResult> HidePost(Guid id, CancellationToken cancellationToken)
    {
        var post = await dbContext.CommunityPosts.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (post is null) throw new NotFoundException("Resource was not found.");
        post.IsHidden = true;
        await dbContext.SaveChangesAsync(cancellationToken);
        return OkMessage("Operation completed successfully.");
    }

    [HttpDelete("comments/{id:guid}")]
    public async Task<IActionResult> HideComment(Guid id, CancellationToken cancellationToken)
    {
        var comment = await dbContext.PostComments.Include(item => item.Post).FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (comment is null) throw new NotFoundException("Resource was not found.");
        if (!comment.IsHidden)
        {
            comment.IsHidden = true;
            comment.Post.CommentCount = Math.Max(0, comment.Post.CommentCount - 1);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        return OkMessage("Operation completed successfully.");
    }
}

public sealed record AdminCommunityPostDto(Guid Id, string Title, string AuthorName, string Category, int LikeCount, int CommentCount, bool IsPinned, bool IsHidden, DateTime CreatedAt);
