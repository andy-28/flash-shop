using FlashShop.Domain.Entities;

namespace FlashShop.Application.Common.Interfaces;

public interface IInventoryLogRepository
{
    Task AddAsync(InventoryLog log, CancellationToken cancellationToken = default);
}
