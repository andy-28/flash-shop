namespace FlashShop.Api.BackgroundJobs;

public sealed record FlashSaleOrderMessage(
    Guid SaleId,
    Guid UserId,
    Guid VariantId,
    int Quantity,
    decimal UnitPrice,
    DateTime PurchasedAt);
