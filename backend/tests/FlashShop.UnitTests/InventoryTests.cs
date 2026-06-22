using FluentAssertions;
using FlashShop.Domain.Entities;
using Xunit;

namespace FlashShop.UnitTests;

public class InventoryTests
{
    private static Inventory NewInventory(int available)
        => new Inventory
        {
            Id = Guid.NewGuid(),
            VariantId = Guid.NewGuid(),
            TotalStock = available,
            AvailableStock = available,
            FrozenStock = 0,
            SoldCount = 0,
            Version = 0
        };

    [Fact]
    public void Freeze_MovesAvailableToFrozen()
    {
        var inv = NewInventory(10);
        inv.Freeze(3);
        inv.AvailableStock.Should().Be(7);
        inv.FrozenStock.Should().Be(3);
    }

    [Fact]
    public void Freeze_ThrowsWhenInsufficient()
    {
        var inv = NewInventory(2);
        var act = () => inv.Freeze(5);
        act.Should().Throw<Exception>();
    }

    [Fact]
    public void Commit_MovesFrozenToSold()
    {
        var inv = NewInventory(10);
        inv.Freeze(4);
        inv.Commit(4);
        inv.FrozenStock.Should().Be(0);
        inv.SoldCount.Should().Be(4);
    }

    [Fact]
    public void Release_MovesFrozenBackToAvailable()
    {
        var inv = NewInventory(10);
        inv.Freeze(4);
        inv.Release(4);
        inv.AvailableStock.Should().Be(10);
        inv.FrozenStock.Should().Be(0);
    }
}
