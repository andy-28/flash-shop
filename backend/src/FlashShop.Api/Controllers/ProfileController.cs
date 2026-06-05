using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Enums;
using FlashShop.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.Controllers;

[ApiController]
public sealed class ProfileController(
    AppDbContext dbContext,
    ICurrentUserService currentUser,
    IMediaRepository mediaRepository) : ControllerBase
{
    private static readonly OrderStatus[] PaidStatuses = [OrderStatus.Paid, OrderStatus.Shipping, OrderStatus.Delivered];

    [Authorize]
    [HttpGet("api/profile")]
    public async Task<IActionResult> GetMyProfile(CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(await ToUserProfileDto(user, cancellationToken));
    }

    [Authorize]
    [HttpPut("api/profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken cancellationToken)
    {
        var userId = currentUser.UserId;
        if (!userId.HasValue)
        {
            return Unauthorized();
        }

        var user = await dbContext.Users.FirstOrDefaultAsync(item => item.Id == userId, cancellationToken);
        if (user is null)
        {
            return Unauthorized();
        }

        user.DisplayName = Normalize(request.DisplayName, 50);
        user.Bio = Normalize(request.Bio, 500);
        user.AvatarUrl = Normalize(request.AvatarUrl, 500);

        await mediaRepository.ClearUsageAsync("User", user.Id, "AvatarUrl", cancellationToken);
        if (!string.IsNullOrWhiteSpace(user.AvatarUrl))
        {
            await mediaRepository.TrackUsageByPathAsync(user.AvatarUrl, "User", user.Id, "AvatarUrl", cancellationToken);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(await ToUserProfileDto(user, cancellationToken));
    }

    [HttpGet("api/users/{id:guid}")]
    public async Task<IActionResult> GetPublicProfile(Guid id, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.AsNoTracking().FirstOrDefaultAsync(item => item.Id == id, cancellationToken);
        if (user is null)
        {
            return NotFound();
        }

        var communityPosts = await dbContext.CommunityPosts.AsNoTracking().CountAsync(post => post.AuthorId == id && !post.IsHidden, cancellationToken);
        var communityLikes = await dbContext.CommunityPosts.AsNoTracking().Where(post => post.AuthorId == id && !post.IsHidden).SumAsync(post => post.LikeCount, cancellationToken);

        return Ok(new PublicUserProfileDto(
            user.Id,
            user.Name,
            user.DisplayName,
            user.AvatarUrl,
            user.Bio,
            user.CreatedAt,
            communityPosts,
            communityLikes));
    }

    [HttpGet("api/users/{id:guid}/posts")]
    public async Task<IActionResult> GetUserPosts(Guid id, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var query = dbContext.CommunityPosts
            .Include(post => post.Author)
            .AsNoTracking()
            .Where(post => post.AuthorId == id && !post.IsHidden)
            .OrderByDescending(post => post.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var posts = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return Ok(new PagedResult<PostDto>(
            posts.Select(post => new PostDto(
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
                false,
                post.CreatedAt)).ToList(),
            totalCount,
            page,
            pageSize));
    }

    private async Task<UserProfileDto> ToUserProfileDto(FlashShop.Domain.Entities.User user, CancellationToken cancellationToken)
    {
        var totalOrders = await dbContext.Orders.AsNoTracking().CountAsync(order => order.UserId == user.Id && PaidStatuses.Contains(order.Status), cancellationToken);
        var totalSpent = await dbContext.Orders.AsNoTracking().Where(order => order.UserId == user.Id && PaidStatuses.Contains(order.Status)).SumAsync(order => order.FinalAmount, cancellationToken);
        var communityPosts = await dbContext.CommunityPosts.AsNoTracking().CountAsync(post => post.AuthorId == user.Id && !post.IsHidden, cancellationToken);
        var communityLikes = await dbContext.CommunityPosts.AsNoTracking().Where(post => post.AuthorId == user.Id && !post.IsHidden).SumAsync(post => post.LikeCount, cancellationToken);

        return new UserProfileDto(
            user.Id,
            user.Name,
            user.DisplayName,
            user.Email,
            user.AvatarUrl,
            user.Bio,
            user.Role.ToString(),
            user.CreatedAt,
            new UserStatsDto(totalOrders, totalSpent, communityPosts, communityLikes));
    }

    private static string? Normalize(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var normalized = value.Trim();
        return normalized.Length > maxLength ? normalized[..maxLength] : normalized;
    }
}

public sealed record UpdateProfileRequest(string? DisplayName, string? Bio, string? AvatarUrl);

public sealed record UserProfileDto(
    Guid Id,
    string Name,
    string? DisplayName,
    string Email,
    string? AvatarUrl,
    string? Bio,
    string Role,
    DateTime CreatedAt,
    UserStatsDto? Stats);

public sealed record UserStatsDto(int TotalOrders, decimal TotalSpent, int CommunityPosts, int CommunityLikes);

public sealed record PublicUserProfileDto(
    Guid Id,
    string Name,
    string? DisplayName,
    string? AvatarUrl,
    string? Bio,
    DateTime CreatedAt,
    int CommunityPosts,
    int CommunityLikes);
