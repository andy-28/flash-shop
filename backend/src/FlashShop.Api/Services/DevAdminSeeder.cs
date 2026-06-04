using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using FlashShop.Domain.Enums;
using FlashShop.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.Services;

public static class DevAdminSeeder
{
    public static async Task SeedAsync(WebApplication app)
    {
        var adminEmail = app.Configuration["AdminSeed:Email"] ?? "admin@flashshop.dev";
        var adminPassword = app.Configuration["AdminSeed:Password"];

        if (string.IsNullOrWhiteSpace(adminPassword))
        {
            throw new InvalidOperationException("AdminSeed:Password is required.");
        }

        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        if (await dbContext.Users.AnyAsync(x => x.Email == adminEmail))
        {
            return;
        }

        dbContext.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = adminEmail,
            Name = "FlashShop Admin",
            PasswordHash = passwordHasher.Hash(adminPassword),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();
    }
}
