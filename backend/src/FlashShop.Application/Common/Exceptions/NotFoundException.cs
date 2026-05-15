namespace FlashShop.Application.Common.Exceptions;

public sealed class NotFoundException(string message) : Exception(message)
{
    public string Code { get; } = "NOT_FOUND";
}
