using FlashShop.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<InventoryLog> InventoryLogs => Set<InventoryLog>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Shipment> Shipments => Set<Shipment>();
    public DbSet<Coupon> Coupons => Set<Coupon>();
    public DbSet<CouponUsage> CouponUsages => Set<CouponUsage>();
    public DbSet<FlashSale> FlashSales => Set<FlashSale>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<ContentBlock> ContentBlocks => Set<ContentBlock>();
    public DbSet<ContentBlockMedia> ContentBlockMedia => Set<ContentBlockMedia>();
    public DbSet<ContentVersion> ContentVersions => Set<ContentVersion>();
    public DbSet<MediaFile> MediaFiles => Set<MediaFile>();
    public DbSet<MediaFileUsage> MediaFileUsages => Set<MediaFileUsage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
