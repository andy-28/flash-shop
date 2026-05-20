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
        if (!app.Environment.IsDevelopment())
        {
            return;
        }

        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var email = "admin@flashshop.dev";

        if (await dbContext.Users.AnyAsync(x => x.Email == email))
        {
            return;
        }

        dbContext.Users.Add(new User
        {
            Id = Guid.NewGuid(),
            Email = email,
            Name = "FlashShop Admin",
            PasswordHash = passwordHasher.Hash("Admin123!"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        });

        await dbContext.SaveChangesAsync();
    }
}
