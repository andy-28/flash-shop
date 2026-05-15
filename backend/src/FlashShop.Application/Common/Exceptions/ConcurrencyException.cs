namespace FlashShop.Application.Common.Exceptions;

public sealed class ConcurrencyException(string message) : Exception(message)
{
    public string Code { get; } = "CONCURRENCY_ERROR";
}
