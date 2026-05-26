using FlashShop.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace FlashShop.Infrastructure.Settings;

public sealed class OrderSettings(IConfiguration configuration) : IOrderSettings
{
    public int PaymentTimeoutMinutes
    {
        get
        {
            var configuredValue = configuration["OrderSettings:PaymentTimeoutMinutes"];
            return int.TryParse(configuredValue, out var minutes) ? Math.Max(minutes, 1) : 30;
        }
    }
}
