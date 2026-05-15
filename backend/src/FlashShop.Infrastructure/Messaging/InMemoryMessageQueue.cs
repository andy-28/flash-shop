using FlashShop.Application.Common.Interfaces;
using Microsoft.Extensions.Logging;

namespace FlashShop.Infrastructure.Messaging;

public sealed class InMemoryMessageQueue(ILogger<InMemoryMessageQueue> logger) : IMessageQueue
{
    public Task PublishAsync<T>(T message, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Published in-memory message {MessageType}", typeof(T).Name);
        return Task.CompletedTask;
    }
}
