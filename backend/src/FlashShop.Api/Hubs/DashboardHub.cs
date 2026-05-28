using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace FlashShop.Api.Hubs;

[Authorize(Roles = "Admin")]
public sealed class DashboardHub(ILogger<DashboardHub> logger) : Hub
{
    public override async Task OnConnectedAsync()
    {
        logger.LogInformation("Admin connected to DashboardHub: {ConnectionId}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        logger.LogInformation("Admin disconnected from DashboardHub: {ConnectionId}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}
