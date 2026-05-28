using FlashShop.Application.AuditLog.DTOs;
using FlashShop.Application.Dashboard.DTOs;
using FlashShop.Domain.Enums;
using FlashShop.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Admin")]
public sealed class AdminDashboardController(AppDbContext dbContext) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var todayStart = now.Date;
        var tomorrowStart = todayStart.AddDays(1);
        var sevenDaysStart = todayStart.AddDays(-6);
        var paidStatuses = new[] { OrderStatus.Paid, OrderStatus.Shipping, OrderStatus.Delivered };

        var todayOrderCount = await dbContext.Orders
            .CountAsync(order => order.CreatedAt >= todayStart && order.CreatedAt < tomorrowStart, cancellationToken);

        var todayRevenue = await dbContext.Orders
            .Where(order => paidStatuses.Contains(order.Status)
                && order.PaidAt != null
                && order.PaidAt >= todayStart
                && order.PaidAt < tomorrowStart)
            .SumAsync(order => (decimal?)order.FinalAmount, cancellationToken) ?? 0;

        var todayNewUsers = await dbContext.Users
            .CountAsync(user => user.CreatedAt >= todayStart && user.CreatedAt < tomorrowStart, cancellationToken);

        var totalProducts = await dbContext.Products
            .CountAsync(product => product.Status == "Active", cancellationToken);

        var totalOrders = await dbContext.Orders.CountAsync(cancellationToken);

        var totalRevenue = await dbContext.Orders
            .Where(order => paidStatuses.Contains(order.Status))
            .SumAsync(order => (decimal?)order.FinalAmount, cancellationToken) ?? 0;

        var lowStockCount = await dbContext.Inventories
            .Where(inventory => inventory.AvailableStock <= 5
                && inventory.Variant != null
                && inventory.Variant.Status == "Active")
            .CountAsync(cancellationToken);

        var ordersForDailyStats = await dbContext.Orders
            .Where(order => order.CreatedAt >= sevenDaysStart && order.CreatedAt < tomorrowStart)
            .Select(order => new
            {
                Date = order.CreatedAt.Date,
                order.Status,
                order.FinalAmount
            })
            .ToListAsync(cancellationToken);

        var dailyStats = Enumerable.Range(0, 7)
            .Select(offset =>
            {
                var date = sevenDaysStart.AddDays(offset);
                var orders = ordersForDailyStats.Where(order => order.Date == date).ToList();
                return new DailyStatDto(
                    date.ToString("yyyy-MM-dd"),
                    orders.Count,
                    orders.Where(order => paidStatuses.Contains(order.Status)).Sum(order => order.FinalAmount));
            })
            .ToList();

        var recentOrders = await dbContext.Orders
            .Include(order => order.User)
            .OrderByDescending(order => order.CreatedAt)
            .Take(10)
            .Select(order => new RecentOrderDto(
                order.Id,
                order.OrderNo,
                order.User == null ? "Unknown" : order.User.Name,
                order.User == null ? string.Empty : order.User.Email,
                order.Status.ToString(),
                order.FinalAmount,
                order.CreatedAt))
            .ToListAsync(cancellationToken);

        var paidOrderItems = await dbContext.OrderItems
            .Where(item => item.Order != null && paidStatuses.Contains(item.Order.Status))
            .ToListAsync(cancellationToken);

        var topProducts = paidOrderItems
            .GroupBy(item => new { ProductId = item.VariantId, item.ProductName })
            .Select(group => new TopProductDto(
                group.Key.ProductId,
                group.Key.ProductName,
                group.Sum(item => item.Quantity),
                group.Sum(item => item.Subtotal)))
            .OrderByDescending(product => product.TotalSold)
            .Take(5)
            .ToList();

        return Ok(new DashboardSummaryDto(
            todayOrderCount,
            todayRevenue,
            todayNewUsers,
            totalProducts,
            totalOrders,
            totalRevenue,
            lowStockCount,
            dailyStats,
            recentOrders,
            topProducts));
    }

    [HttpGet("/api/admin/audit-logs")]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] string? entityType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        var safePage = Math.Max(page, 1);
        var safePageSize = Math.Clamp(pageSize, 1, 100);
        var query = dbContext.AuditLogs.Include(log => log.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(entityType))
        {
            query = query.Where(log => log.EntityType == entityType.Trim());
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var logs = await query
            .OrderByDescending(log => log.CreatedAt)
            .Skip((safePage - 1) * safePageSize)
            .Take(safePageSize)
            .Select(log => new AuditLogDto(
                log.Id,
                log.User == null ? "Unknown" : log.User.Name,
                log.Action,
                log.EntityType,
                log.EntityId,
                log.Detail,
                log.CreatedAt))
            .ToListAsync(cancellationToken);

        return Ok(new AuditLogListDto(logs, totalCount, safePage, safePageSize));
    }
}
