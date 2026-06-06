namespace FlashShop.Application.Common.Exceptions;

public sealed class ConcurrencyException(string message = "Data was modified by another process. Please retry.") : Exception(message)
{
    public string Code { get; } = "CONCURRENCY_ERROR";
}
