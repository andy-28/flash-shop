using FlashShop.Domain.Entities;

namespace FlashShop.Application.Common.Interfaces;

public interface IFlashSaleService
{
    Task LoadStockToRedisAsync(Guid saleId, int stock, CancellationToken cancellationToken = default);
    Task LoadSaleInfoToRedisAsync(FlashSale sale, CancellationToken cancellationToken = default);
    Task<FlashSalePurchaseAttempt> TryPurchaseAsync(Guid saleId, Guid userId, int quantity, int perUserLimit, CancellationToken cancellationToken = default);
    Task<int> GetRemainingStockAsync(Guid saleId, CancellationToken cancellationToken = default);
}

public sealed record FlashSalePurchaseAttempt(FlashSalePurchaseResult Result, int RemainingStock);

public enum FlashSalePurchaseResult
{
    Success,
    AlreadyPurchased,
    SoldOut
}
