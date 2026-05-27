namespace FlashShop.Application.Common;

public static class CacheKeys
{
    public const string ProductListPrefix = "products:list:";
    public const string ProductDetailPrefix = "products:detail:";
    public const string ContentPrefix = "content:";

    public static string ProductList(int page, int pageSize, string? category, string? search, string? sortBy = null)
        => $"{ProductListPrefix}{page}:{pageSize}:{Normalize(category, "all")}:{Normalize(search, "none")}:{Normalize(sortBy, "default")}";

    public static string ProductDetail(Guid productId)
        => $"{ProductDetailPrefix}{productId}";

    public static string Content(string placement)
        => $"{ContentPrefix}{Normalize(placement, "none")}";

    private static string Normalize(string? value, string fallback)
        => string.IsNullOrWhiteSpace(value) ? fallback : value.Trim().ToLowerInvariant();
}
