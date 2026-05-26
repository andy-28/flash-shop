using FlashShop.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.BackgroundJobs;

// Not registered by default. OrderTimeoutJob owns stock release for expired orders;
// this job is a diagnostics-only safety check for future operations.
public sealed class InventoryReleaseJob(
    IServiceScopeFactory scopeFactory,
    ILogger<InventoryReleaseJob> logger) : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(10);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("InventoryReleaseJob consistency checker started");

        while (!stoppingToken.IsCancellationRequested)
        {
            await CheckInventoryConsistencyAsync(stoppingToken);
            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task CheckInventoryConsistencyAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var inconsistentInventories = await dbContext.Inventories
            .AsNoTracking()
            .Where(inventory => inventory.TotalStock != inventory.AvailableStock + inventory.FrozenStock + inventory.SoldCount)
            .ToListAsync(cancellationToken);

        foreach (var inventory in inconsistentInventories)
        {
            logger.LogWarning(
                "Inventory consistency warning for {InventoryId}: total={Total}, available={Available}, frozen={Frozen}, sold={Sold}",
                inventory.Id,
                inventory.TotalStock,
                inventory.AvailableStock,
                inventory.FrozenStock,
                inventory.SoldCount);
        }
    }
}
