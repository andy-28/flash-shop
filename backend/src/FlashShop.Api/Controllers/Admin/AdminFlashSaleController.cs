using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using FlashShop.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/flash-sale")]
[Authorize(Roles = "Admin")]
public sealed class AdminFlashSaleController(
    AppDbContext dbContext,
    IFlashSaleService flashSaleService) : ApiControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetList(CancellationToken cancellationToken)
    {
        var sales = await dbContext.FlashSales
            .Include(sale => sale.Variant)
            .ThenInclude(variant => variant.Product)
            .OrderByDescending(sale => sale.CreatedAt)
            .ToListAsync(cancellationToken);

        return OkResponse(sales.Select(ToAdminDto));
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateFlashSaleRequest request, CancellationToken cancellationToken)
    {
        var variant = await dbContext.ProductVariants
            .Include(candidate => candidate.Product)
            .FirstOrDefaultAsync(candidate => candidate.Id == request.VariantId, cancellationToken);
        if (variant is null)
        {
            throw new BusinessException("Product variant was not found.");
        }

        if (request.TotalStock <= 0 || request.FlashPrice <= 0 || request.StartAt >= request.EndAt)
        {
            throw new BusinessException("Flash sale settings are invalid.");
        }

        var sale = new FlashSale
        {
            Id = Guid.NewGuid(),
            VariantId = request.VariantId,
            Title = request.Title.Trim(),
            FlashPrice = request.FlashPrice,
            TotalStock = request.TotalStock,
            SoldCount = 0,
            PerUserLimit = Math.Max(request.PerUserLimit, 1),
            StartAt = request.StartAt,
            EndAt = request.EndAt,
            Status = "Pending",
            CreatedAt = DateTime.UtcNow
        };

        dbContext.FlashSales.Add(sale);
        await dbContext.SaveChangesAsync(cancellationToken);

        sale.Variant = variant;
        return CreatedResponse(ToAdminDto(sale));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateFlashSaleRequest request, CancellationToken cancellationToken)
    {
        var sale = await dbContext.FlashSales.FindAsync([id], cancellationToken);
        if (sale is null)
        {
            throw new NotFoundException("Flash sale was not found.");
        }

        if (sale.Status == "Active")
        {
            throw new BusinessException("Active flash sale cannot be edited.");
        }

        sale.Title = request.Title.Trim();
        sale.FlashPrice = request.FlashPrice;
        sale.TotalStock = request.TotalStock;
        sale.PerUserLimit = Math.Max(request.PerUserLimit, 1);
        sale.StartAt = request.StartAt;
        sale.EndAt = request.EndAt;

        await dbContext.SaveChangesAsync(cancellationToken);
        return OkMessage("Operation completed successfully.");
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken cancellationToken)
    {
        var sale = await dbContext.FlashSales
            .Include(candidate => candidate.Variant)
            .FirstOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);
        if (sale is null)
        {
            throw new NotFoundException("Flash sale was not found.");
        }

        sale.Status = "Active";
        await flashSaleService.LoadStockToRedisAsync(id, Math.Max(sale.TotalStock - sale.SoldCount, 0), cancellationToken);
        await flashSaleService.LoadSaleInfoToRedisAsync(sale, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return OkResponse(ToAdminDto(sale));
    }

    [HttpPost("{id:guid}/end")]
    public async Task<IActionResult> End(Guid id, CancellationToken cancellationToken)
    {
        var sale = await dbContext.FlashSales.FindAsync([id], cancellationToken);
        if (sale is null)
        {
            throw new NotFoundException("Flash sale was not found.");
        }

        sale.Status = "Ended";
        await dbContext.SaveChangesAsync(cancellationToken);
        return OkMessage("Operation completed successfully.");
    }

    private static AdminFlashSaleDto ToAdminDto(FlashSale sale)
    {
        return new AdminFlashSaleDto(
            sale.Id,
            sale.VariantId,
            sale.Variant.Product?.Name ?? "Product",
            sale.Variant.SpecName,
            sale.Title,
            sale.FlashPrice,
            sale.TotalStock,
            sale.SoldCount,
            sale.PerUserLimit,
            sale.StartAt,
            sale.EndAt,
            sale.Status);
    }
}

public sealed record CreateFlashSaleRequest(
    Guid VariantId,
    string Title,
    decimal FlashPrice,
    int TotalStock,
    int PerUserLimit,
    DateTime StartAt,
    DateTime EndAt);

public sealed record UpdateFlashSaleRequest(
    string Title,
    decimal FlashPrice,
    int TotalStock,
    int PerUserLimit,
    DateTime StartAt,
    DateTime EndAt);

public sealed record AdminFlashSaleDto(
    Guid Id,
    Guid VariantId,
    string ProductName,
    string SpecName,
    string Title,
    decimal FlashPrice,
    int TotalStock,
    int SoldCount,
    int PerUserLimit,
    DateTime StartAt,
    DateTime EndAt,
    string Status);
