namespace FlashShop.Api.BackgroundJobs;

public interface IOrderTimeoutProcessor
{
    Task<int> ProcessExpiredOrders(CancellationToken cancellationToken);
}
