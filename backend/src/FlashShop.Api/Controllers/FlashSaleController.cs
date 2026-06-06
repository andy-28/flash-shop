using FlashShop.Api.BackgroundJobs;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Domain.Entities;
using FlashShop.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FlashShop.Api.Controllers;

[ApiController]
[Route("api/flash-sale")]
public sealed class FlashSaleController(
    AppDbContext dbContext,
    IFlashSaleService flashSaleService,
    ICurrentUserService currentUserService,
    FlashSaleOrderChannel orderChannel) : ApiControllerBase
{
    [HttpGet("active")]
    public async Task<IActionResult> GetActive(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var sales = await dbContext.FlashSales
            .Include(sale => sale.Variant)
            .ThenInclude(variant => variant.Product)
            .Where(sale => sale.Status == "Active" && sale.EndAt > now)
            .OrderBy(sale => sale.StartAt)
            .ToListAsync(cancellationToken);

        var result = new List<FlashSaleDto>();
        foreach (var sale in sales)
        {
            result.Add(await ToDtoAsync(sale, cancellationToken));
        }

        return OkResponse(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var sale = await dbContext.FlashSales
            .Include(candidate => candidate.Variant)
            .ThenInclude(variant => variant.Product)
            .FirstOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);

        if (sale is null)
        {
            throw new NotFoundException("Flash sale was not found.");
        }

        return OkResponse(await ToDtoAsync(sale, cancellationToken));
    }

    [HttpGet("{id:guid}/stock")]
    public async Task<IActionResult> GetStock(Guid id, CancellationToken cancellationToken)
    {
        var sale = await dbContext.FlashSales.FindAsync([id], cancellationToken);
        if (sale is null)
        {
            throw new NotFoundException("Flash sale was not found.");
        }

        return OkResponse(new { remainingStock = await GetRemainingStockAsync(sale, cancellationToken) });
    }

    [Authorize]
    [HttpPost("{id:guid}/purchase")]
    public async Task<IActionResult> Purchase(Guid id, CancellationToken cancellationToken)
    {
        var userId = currentUserService.UserId;
        if (!userId.HasValue)
        {
            throw new UnauthorizedAccessException();
        }

        var sale = await dbContext.FlashSales
            .Include(candidate => candidate.Variant)
            .FirstOrDefaultAsync(candidate => candidate.Id == id, cancellationToken);
        if (sale is null)
        {
            throw new NotFoundException("Flash sale was not found.");
        }

        var now = DateTime.UtcNow;
        if (sale.Status != "Active" || now < sale.StartAt)
        {
            throw new BusinessException("Flash sale has not started.");
        }

        if (now >= sale.EndAt)
        {
            throw new BusinessException("Flash sale has ended.");
        }

        var attempt = await flashSaleService.TryPurchaseAsync(id, userId.Value, 1, sale.PerUserLimit, cancellationToken);
        if (attempt.Result == FlashSalePurchaseResult.AlreadyPurchased)
        {
            throw new BusinessException("You already purchased this flash sale item.");
        }

        if (attempt.Result == FlashSalePurchaseResult.SoldOut)
        {
            throw new BusinessException("Sold out.");
        }

        await orderChannel.Writer.WriteAsync(new FlashSaleOrderMessage(
            sale.Id,
            userId.Value,
            sale.VariantId,
            1,
            sale.FlashPrice,
            now), cancellationToken);

        return AcceptedResponse(new { remainingStock = attempt.RemainingStock });
    }

    private async Task<FlashSaleDto> ToDtoAsync(FlashSale sale, CancellationToken cancellationToken)
    {
        return new FlashSaleDto(
            sale.Id,
            sale.VariantId,
            sale.Variant.ProductId,
            sale.Variant.Product?.Name ?? "Flash sale product",
            sale.Variant.SpecName,
            sale.Title,
            sale.Variant.Price,
            sale.FlashPrice,
            sale.TotalStock,
            await GetRemainingStockAsync(sale, cancellationToken),
            sale.SoldCount,
            sale.PerUserLimit,
            sale.StartAt,
            sale.EndAt,
            sale.Status);
    }

    private async Task<int> GetRemainingStockAsync(FlashSale sale, CancellationToken cancellationToken)
    {
        return sale.Status == "Active"
            ? await flashSaleService.GetRemainingStockAsync(sale.Id, cancellationToken)
            : Math.Max(sale.TotalStock - sale.SoldCount, 0);
    }
}

public sealed record FlashSaleDto(
    Guid Id,
    Guid VariantId,
    Guid ProductId,
    string ProductName,
    string SpecName,
    string Title,
    decimal OriginalPrice,
    decimal FlashPrice,
    int TotalStock,
    int RemainingStock,
    int SoldCount,
    int PerUserLimit,
    DateTime StartAt,
    DateTime EndAt,
    string Status);
