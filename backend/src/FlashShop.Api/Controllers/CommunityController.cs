using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using FlashShop.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/community")]
public sealed class CommunityController(AppDbContext dbContext, ICurrentUserService currentUser) : ApiControllerBase
{
    private static readonly string[] Categories = ["General", "Unboxing", "Outfit", "QnA", "Announcement"];

    [HttpGet("categories")]
    public IActionResult GetCategories() => Ok(Categories);

    [HttpGet("posts")]
    public async Task<IActionResult> GetPosts([FromQuery] string? category, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string sortBy = "latest", CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var userId = currentUser.UserId;
        var query = dbContext.CommunityPosts.Include(post => post.Author).AsNoTracking().Where(post => !post.IsHidden);
        if (!string.IsNullOrWhiteSpace(category) && category != "All")
        {
            query = query.Where(post => post.Category == category);
        }

        query = sortBy == "popular"
            ? query.OrderByDescending(post => post.IsPinned).ThenByDescending(post => post.LikeCount).ThenByDescending(post => post.CreatedAt)
            : query.OrderByDescending(post => post.IsPinned).ThenByDescending(post => post.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var posts = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        var postIds = posts.Select(post => post.Id).ToList();
        var likedIds = userId.HasValue
            ? await dbContext.PostLikes.AsNoTracking().Where(like => like.UserId == userId && postIds.Contains(like.PostId)).Select(like => like.PostId).ToListAsync(cancellationToken)
            : [];

        return OkResponse(new PagedResult<PostDto>(
            posts.Select(post => ToPostDto(post, likedIds.Contains(post.Id))).ToList(),
            totalCount,
            page,
            pageSize));
    }

    [HttpGet("posts/{id:guid}")]
    public async Task<IActionResult> GetPost(Guid id, CancellationToken cancellationToken)
    {
        var post = await dbContext.CommunityPosts.Include(item => item.Author).FirstOrDefaultAsync(item => item.Id == id && !item.IsHidden, cancellationToken);
        if (post is null)
        {
            throw new NotFoundException("Resource was not found.");
        }

        post.ViewCount += 1;
        await dbContext.SaveChangesAsync(cancellationToken);

        var comments = await dbContext.PostComments
            .Include(comment => comment.Author)
            .Include(comment => comment.Replies.Where(reply => !reply.IsHidden)).ThenInclude(reply => reply.Author)
            .AsNoTracking()
            .Where(comment => comment.PostId == id && !comment.IsHidden && comment.ParentCommentId == null)
            .OrderBy(comment => comment.CreatedAt)
            .ToListAsync(cancellationToken);

        var userId = currentUser.UserId;
        var isLiked = userId.HasValue && await dbContext.PostLikes.AnyAsync(like => like.PostId == id && like.UserId == userId, cancellationToken);
        var commentIds = comments.SelectMany(comment => comment.Replies.Append(comment)).Select(comment => comment.Id).ToList();
        var likedCommentIds = userId.HasValue
            ? await dbContext.CommentLikes.AsNoTracking().Where(like => like.UserId == userId && commentIds.Contains(like.CommentId)).Select(like => like.CommentId).ToListAsync(cancellationToken)
            : [];

        return OkResponse(new PostDetailDto(
            post.Id,
            post.AuthorId,
            post.Author.Name,
            post.Author.DisplayName,
            post.Author.AvatarUrl,
            post.Category,
            post.Title,
            post.Content,
            post.ImageUrl,
            post.IsPinned,
            post.LikeCount,
            post.CommentCount,
            post.ViewCount,
            isLiked,
            post.CreatedAt,
            comments.Select(comment => ToCommentDto(comment, likedCommentIds)).ToList()));
    }

    [Authorize]
    [HttpPost("posts")]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new UnauthorizedAccessException();
        if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Content))
        {
            throw new BusinessException("Title and content are required.");
        }

        var post = new CommunityPost
        {
            Id = Guid.NewGuid(),
            AuthorId = userId,
            Category = NormalizeCategory(request.Category),
            Title = request.Title.Trim(),
            Content = request.Content.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        dbContext.CommunityPosts.Add(post);
        await dbContext.SaveChangesAsync(cancellationToken);
        await dbContext.Entry(post).Reference(item => item.Author).LoadAsync(cancellationToken);
        return OkResponse(ToPostDto(post, false));
    }

    [Authorize]
    [HttpPut("posts/{id:guid}")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] CreatePostRequest request, CancellationToken cancellationToken)
    {
        var post = await dbContext.CommunityPosts.FirstOrDefaultAsync(item => item.Id == id && !item.IsHidden, cancellationToken);
        if (post is null) throw new NotFoundException("Resource was not found.");
        if (!CanManage(post.AuthorId)) return Forbid();

        post.Title = request.Title.Trim();
        post.Content = request.Content.Trim();
        post.Category = NormalizeCategory(request.Category);
        post.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim();
        post.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        await dbContext.Entry(post).Reference(item => item.Author).LoadAsync(cancellationToken);
        return OkResponse(ToPostDto(post, false));
    }

    [Authorize]
    [HttpDelete("posts/{id:guid}")]
    public async Task<IActionResult> DeletePost(Guid id, CancellationToken cancellationToken)
    {
        var post = await dbContext.CommunityPosts.FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (post is null) throw new NotFoundException("Resource was not found.");
        if (!CanManage(post.AuthorId)) return Forbid();
        post.IsHidden = true;
        await dbContext.SaveChangesAsync(cancellationToken);
        return OkMessage("Operation completed successfully.");
    }

    [Authorize]
    [HttpPost("posts/{id:guid}/like")]
    public async Task<IActionResult> TogglePostLike(Guid id, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new UnauthorizedAccessException();
        var post = await dbContext.CommunityPosts.FirstOrDefaultAsync(item => item.Id == id && !item.IsHidden, cancellationToken);
        if (post is null) throw new NotFoundException("Resource was not found.");
        var like = await dbContext.PostLikes.FirstOrDefaultAsync(item => item.PostId == id && item.UserId == userId, cancellationToken);
        var isLiked = like is null;
        if (like is null)
        {
            dbContext.PostLikes.Add(new PostLike { Id = Guid.NewGuid(), PostId = id, UserId = userId });
            post.LikeCount += 1;
        }
        else
        {
            dbContext.PostLikes.Remove(like);
            post.LikeCount = Math.Max(0, post.LikeCount - 1);
        }
        await dbContext.SaveChangesAsync(cancellationToken);
        return OkResponse(new LikeResult(isLiked, post.LikeCount));
    }

    [Authorize]
    [HttpPost("posts/{id:guid}/comments")]
    public async Task<IActionResult> CreateComment(Guid id, [FromBody] CreateCommentRequest request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new UnauthorizedAccessException();
        var post = await dbContext.CommunityPosts.FirstOrDefaultAsync(item => item.Id == id && !item.IsHidden, cancellationToken);
        if (post is null) throw new NotFoundException("Resource was not found.");
        if (string.IsNullOrWhiteSpace(request.Content)) throw new BusinessException("Content is required.");
        if (request.ParentCommentId.HasValue)
        {
            var parentExists = await dbContext.PostComments.AnyAsync(comment => comment.Id == request.ParentCommentId && comment.PostId == id && !comment.IsHidden, cancellationToken);
            if (!parentExists) throw new BusinessException("Parent comment was not found.");
        }

        var comment = new PostComment { Id = Guid.NewGuid(), PostId = id, AuthorId = userId, ParentCommentId = request.ParentCommentId, Content = request.Content.Trim(), CreatedAt = DateTime.UtcNow };
        dbContext.PostComments.Add(comment);
        post.CommentCount += 1;
        await dbContext.SaveChangesAsync(cancellationToken);
        await dbContext.Entry(comment).Reference(item => item.Author).LoadAsync(cancellationToken);
        return OkResponse(ToCommentDto(comment, []));
    }

    [Authorize]
    [HttpDelete("comments/{id:guid}")]
    public async Task<IActionResult> DeleteComment(Guid id, CancellationToken cancellationToken)
    {
        var comment = await dbContext.PostComments.Include(item => item.Post).FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (comment is null) throw new NotFoundException("Resource was not found.");
        if (!CanManage(comment.AuthorId)) return Forbid();
        if (!comment.IsHidden)
        {
            comment.IsHidden = true;
            comment.Post.CommentCount = Math.Max(0, comment.Post.CommentCount - 1);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        return OkMessage("Operation completed successfully.");
    }

    [Authorize]
    [HttpPost("comments/{id:guid}/like")]
    public async Task<IActionResult> ToggleCommentLike(Guid id, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId ?? throw new UnauthorizedAccessException();
        var comment = await dbContext.PostComments.FirstOrDefaultAsync(item => item.Id == id && !item.IsHidden, cancellationToken);
        if (comment is null) throw new NotFoundException("Resource was not found.");
        var like = await dbContext.CommentLikes.FirstOrDefaultAsync(item => item.CommentId == id && item.UserId == userId, cancellationToken);
        var isLiked = like is null;
        if (like is null)
        {
            dbContext.CommentLikes.Add(new CommentLike { Id = Guid.NewGuid(), CommentId = id, UserId = userId });
            comment.LikeCount += 1;
        }
        else
        {
            dbContext.CommentLikes.Remove(like);
            comment.LikeCount = Math.Max(0, comment.LikeCount - 1);
        }
        await dbContext.SaveChangesAsync(cancellationToken);
        return OkResponse(new LikeResult(isLiked, comment.LikeCount));
    }

    private bool CanManage(Guid authorId) => currentUser.UserId == authorId || currentUser.Role == "Admin";
    private static string NormalizeCategory(string category) => Categories.Contains(category) ? category : "General";
    private static PostDto ToPostDto(CommunityPost post, bool liked) => new(post.Id, post.AuthorId, post.Author.Name, post.Author.DisplayName, post.Author.AvatarUrl, post.Category, post.Title, post.Content, post.ImageUrl, post.IsPinned, post.LikeCount, post.CommentCount, post.ViewCount, liked, post.CreatedAt);
    private static CommentDto ToCommentDto(PostComment comment, IReadOnlyCollection<Guid> likedCommentIds) => new(comment.Id, comment.Author.Name, comment.Author.DisplayName, comment.Author.AvatarUrl, comment.AuthorId, comment.Content, comment.LikeCount, likedCommentIds.Contains(comment.Id), comment.CreatedAt, comment.ParentCommentId, comment.Replies.Where(reply => !reply.IsHidden).OrderBy(reply => reply.CreatedAt).Select(reply => ToCommentDto(reply, likedCommentIds)).ToList());
}

public sealed record CreatePostRequest(string Title, string Content, string Category, string? ImageUrl);
public sealed record CreateCommentRequest(string Content, Guid? ParentCommentId);
public sealed record LikeResult(bool IsLiked, int LikeCount);
public sealed record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);
public sealed record PostDto(Guid Id, Guid AuthorId, string AuthorName, string? AuthorDisplayName, string? AuthorAvatarUrl, string Category, string Title, string Content, string? ImageUrl, bool IsPinned, int LikeCount, int CommentCount, int ViewCount, bool IsLikedByMe, DateTime CreatedAt);
public sealed record PostDetailDto(Guid Id, Guid AuthorId, string AuthorName, string? AuthorDisplayName, string? AuthorAvatarUrl, string Category, string Title, string Content, string? ImageUrl, bool IsPinned, int LikeCount, int CommentCount, int ViewCount, bool IsLikedByMe, DateTime CreatedAt, List<CommentDto> Comments);
public sealed record CommentDto(Guid Id, string AuthorName, string? AuthorDisplayName, string? AuthorAvatarUrl, Guid AuthorId, string Content, int LikeCount, bool IsLikedByMe, DateTime CreatedAt, Guid? ParentCommentId, List<CommentDto> Replies);
