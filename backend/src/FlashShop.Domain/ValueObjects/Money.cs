namespace FlashShop.Domain.ValueObjects;

public sealed record Money(decimal Amount, string Currency = "TWD")
{
    public static Money Zero(string currency = "TWD") => new(0, currency);
}
