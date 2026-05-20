using FlashShop.Application.Cart.DTOs;
using FlashShop.Domain.Entities;

namespace FlashShop.Application.Cart;

internal static class CartMapper
{
    public static CartDto ToDto(Domain.Entities.Cart? cart)
    {
        if (cart is null)
        {
            return new CartDto();
        }

        var items = cart.Items
            .OrderBy(x => x.AddedAt)
            .Select(item =>
            {
                var variant = item.Variant;
                var product = variant?.Product;
                var availableStock = variant?.Inventory?.AvailableStock ?? 0;
                var unitPrice = variant?.Price ?? 0;

                return new CartItemDto
                {
                    CartItemId = item.Id,
                    VariantId = item.VariantId,
                    ProductId = variant?.ProductId ?? Guid.Empty,
                    ProductName = product?.Name ?? string.Empty,
                    SpecName = variant?.SpecName ?? string.Empty,
                    ImageUrl = null,
                    Quantity = item.Quantity,
                    UnitPrice = unitPrice,
                    AvailableStock = availableStock,
                    Subtotal = unitPrice * item.Quantity,
                    IsAvailable = variant?.Status == "Active" && product?.Status == "Active" && availableStock > 0
                };
            })
            .ToList();

        return new CartDto
        {
            Id = cart.Id,
            Items = items,
            TotalAmount = items.Sum(x => x.Subtotal),
            ItemCount = items.Sum(x => x.Quantity)
        };
    }
}
