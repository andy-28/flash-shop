namespace FlashShop.Application.Common.Models;

public sealed record PagedResult<T>(
    List<T> Items,
    int TotalCount,
    int Page,
    int PageSize);
