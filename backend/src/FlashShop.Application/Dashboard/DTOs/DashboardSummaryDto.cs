namespace FlashShop.Application.Dashboard.DTOs;

public sealed record DashboardSummaryDto(
    int TodayOrderCount,
    decimal TodayRevenue,
    int TodayNewUsers,
    int TotalProducts,
    int TotalOrders,
    decimal TotalRevenue,
    int LowStockCount,
    List<DailyStatDto> DailyStats,
    List<RecentOrderDto> RecentOrders,
    List<TopProductDto> TopProducts);

public sealed record DailyStatDto(
    string Date,
    int OrderCount,
    decimal Revenue);

public sealed record RecentOrderDto(
    Guid Id,
    string OrderNo,
    string UserName,
    string UserEmail,
    string Status,
    decimal FinalAmount,
    DateTime CreatedAt);

public sealed record TopProductDto(
    Guid ProductId,
    string ProductName,
    int TotalSold,
    decimal TotalRevenue);
