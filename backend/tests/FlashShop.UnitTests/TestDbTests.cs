using FlashShop.Domain.Entities;
using FlashShop.UnitTests.TestHelpers;
using FluentAssertions;
using Xunit;

namespace FlashShop.UnitTests;

public class TestDbTests
{
    [Fact]
    public void CanSaveAndQuery()
    {
        using var db = TestDb.Create();
        var now = DateTime.UtcNow;

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = "Test",
            Description = "Test product",
            Category = "Test",
            Status = "Active",
            CreatedAt = now,
            UpdatedAt = now
        };

        db.Products.Add(product);
        db.SaveChanges();

        db.Products.Should().HaveCount(1);
    }
}
