namespace FlashShop.Application.Common.Exceptions;

public sealed class BusinessException(string message) : Exception(message)
{
    public string Code { get; } = "BUSINESS_ERROR";
}
