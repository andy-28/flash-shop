using System.Reflection;
using System.Text.Json;
using FlashShop.Application.Common.Interfaces;
using MediatR;

namespace FlashShop.Application.Common.Behaviors;

public sealed class AuditLogBehavior<TRequest, TResponse>(
    ICurrentUserService currentUserService,
    IAuditLogRepository auditLogRepository,
    IUnitOfWork unitOfWork) : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = false
    };

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var response = await next(cancellationToken);

        if (!ShouldAudit(request))
        {
            return response;
        }

        await auditLogRepository.AddAsync(new FlashShop.Domain.Entities.AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = currentUserService.UserId!.Value,
            Action = GetAction(request),
            EntityType = GetEntityType(request),
            EntityId = GetEntityId(request, response),
            Detail = JsonSerializer.Serialize(Sanitize(request), JsonOptions),
            CreatedAt = DateTime.UtcNow
        }, cancellationToken);

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return response;
    }

    private bool ShouldAudit(TRequest request)
    {
        return request.GetType().Name.Contains("Command", StringComparison.Ordinal)
            && currentUserService.UserId.HasValue
            && string.Equals(currentUserService.Role, "Admin", StringComparison.OrdinalIgnoreCase);
    }

    private static string GetAction(TRequest request)
    {
        return request.GetType().Name.Replace("Command", string.Empty, StringComparison.Ordinal);
    }

    private static string GetEntityType(TRequest request)
    {
        var action = GetAction(request);

        if (action.Contains("ContentBlock", StringComparison.Ordinal))
        {
            return "ContentBlock";
        }

        if (action.Contains("Inventory", StringComparison.Ordinal))
        {
            return "Inventory";
        }

        if (action.Contains("Coupon", StringComparison.Ordinal))
        {
            return "Coupon";
        }

        if (action.Contains("Product", StringComparison.Ordinal))
        {
            return "Product";
        }

        if (action.Contains("Order", StringComparison.Ordinal))
        {
            return "Order";
        }

        return action;
    }

    private static Guid GetEntityId(TRequest request, TResponse response)
    {
        if (response is Guid responseId)
        {
            return responseId;
        }

        var responseIdProperty = response?.GetType().GetProperty("Id", BindingFlags.Public | BindingFlags.Instance);
        if (responseIdProperty?.GetValue(response) is Guid dtoId)
        {
            return dtoId;
        }

        foreach (var propertyName in new[] { "Id", "ProductId", "VariantId", "OrderId", "CouponId" })
        {
            var property = request.GetType().GetProperty(propertyName, BindingFlags.Public | BindingFlags.Instance);
            if (property?.GetValue(request) is Guid requestId)
            {
                return requestId;
            }
        }

        return Guid.Empty;
    }

    private static object Sanitize(TRequest request)
    {
        return request.GetType()
            .GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(property => !IsSensitive(property.Name))
            .ToDictionary(property => property.Name, property => property.GetValue(request));
    }

    private static bool IsSensitive(string propertyName)
    {
        return propertyName.Contains("Password", StringComparison.OrdinalIgnoreCase)
            || propertyName.Contains("Token", StringComparison.OrdinalIgnoreCase)
            || propertyName.Contains("Secret", StringComparison.OrdinalIgnoreCase);
    }
}
