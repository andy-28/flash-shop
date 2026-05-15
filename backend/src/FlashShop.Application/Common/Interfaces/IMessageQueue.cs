namespace FlashShop.Application.Common.Interfaces;

public interface IMessageQueue
{
    Task PublishAsync<T>(T message, CancellationToken cancellationToken = default);
}
