namespace FlashShop.Api.BackgroundJobs;

public sealed class OrderTimeoutJob(
    IServiceScopeFactory scopeFactory,
    IConfiguration configuration,
    ILogger<OrderTimeoutJob> logger) : BackgroundService
{
    private readonly TimeSpan _interval = TimeSpan.FromSeconds(GetConfiguredIntervalSeconds(configuration));

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("OrderTimeoutJob started with interval {IntervalSeconds}s", _interval.TotalSeconds);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var processor = scope.ServiceProvider.GetRequiredService<IOrderTimeoutProcessor>();
                await processor.ProcessExpiredOrders(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception exception)
            {
                logger.LogError(exception, "OrderTimeoutJob encountered an error");
            }

            try
            {
                await Task.Delay(_interval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }

        logger.LogInformation("OrderTimeoutJob stopped");
    }

    private static int GetConfiguredIntervalSeconds(IConfiguration configuration)
    {
        var configuredValue = configuration["OrderSettings:TimeoutCheckIntervalSeconds"];
        return int.TryParse(configuredValue, out var seconds) ? Math.Max(seconds, 5) : 60;
    }
}
