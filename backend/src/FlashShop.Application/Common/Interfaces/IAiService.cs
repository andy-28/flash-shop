namespace FlashShop.Application.Common.Interfaces;

public interface IAiService
{
    Task<string> CompleteAsync(IReadOnlyCollection<ChatMessage> messages, CancellationToken cancellationToken = default);
}

public sealed record ChatMessage(string Role, string Content);
