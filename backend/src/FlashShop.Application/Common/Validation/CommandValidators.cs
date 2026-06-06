using FlashShop.Application.Auth.Commands;
using FlashShop.Application.Cart.Commands;
using FlashShop.Application.Content.Commands;
using FlashShop.Application.Coupons.Commands;
using FlashShop.Application.Inventory.Commands;
using FlashShop.Application.Media.Commands;
using FlashShop.Application.Notifications.Commands;
using FlashShop.Application.Orders.Commands;
using FlashShop.Application.PreOrders.Commands;
using FlashShop.Application.Products.Commands;
using FlashShop.Application.Shipments.Commands;
using FluentValidation;

namespace FlashShop.Application.Common.Validation;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(command => command.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(command => command.Password).NotEmpty().MaximumLength(100);
    }
}

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(command => command.Email).NotEmpty().EmailAddress().MaximumLength(255);
        RuleFor(command => command.Password).NotEmpty().MinimumLength(6).MaximumLength(100);
        RuleFor(command => command.Name).NotEmpty().MaximumLength(50);
    }
}

public sealed class AddToCartCommandValidator : AbstractValidator<AddToCartCommand>
{
    public AddToCartCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.VariantId).NotEmpty();
        RuleFor(command => command.Quantity).GreaterThan(0);
    }
}

public sealed class RemoveFromCartCommandValidator : AbstractValidator<RemoveFromCartCommand>
{
    public RemoveFromCartCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.CartItemId).NotEmpty();
    }
}

public sealed class UpdateCartItemCommandValidator : AbstractValidator<UpdateCartItemCommand>
{
    public UpdateCartItemCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.CartItemId).NotEmpty();
        RuleFor(command => command.Quantity).GreaterThan(0);
    }
}

public sealed class CreateContentBlockCommandValidator : AbstractValidator<CreateContentBlockCommand>
{
    public CreateContentBlockCommandValidator()
    {
        RuleFor(command => command.Title).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Subtitle).MaximumLength(500);
        RuleFor(command => command.ImageUrl).NotEmpty().MaximumLength(1000);
        RuleFor(command => command.LinkUrl).MaximumLength(1000);
        RuleFor(command => command.LinkType).NotEmpty().MaximumLength(50);
        RuleFor(command => command.Placement).NotEmpty().MaximumLength(100);
        RuleFor(command => command.Body).MaximumLength(50000);
        RuleFor(command => command.Slug).MaximumLength(200);
        RuleFor(command => command.Category).MaximumLength(50);
        RuleFor(command => command.VideoUrl).MaximumLength(1000);
        RuleFor(command => command.Summary).MaximumLength(1000);
        RuleFor(command => command.CreatedBy).NotEmpty();
        RuleFor(command => command.EndAt).GreaterThan(command => command.StartAt).When(command => command.StartAt.HasValue && command.EndAt.HasValue);
    }
}

public sealed class UpdateContentBlockCommandValidator : AbstractValidator<UpdateContentBlockCommand>
{
    public UpdateContentBlockCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
        RuleFor(command => command.Title).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Subtitle).MaximumLength(500);
        RuleFor(command => command.ImageUrl).NotEmpty().MaximumLength(1000);
        RuleFor(command => command.LinkUrl).MaximumLength(1000);
        RuleFor(command => command.LinkType).NotEmpty().MaximumLength(50);
        RuleFor(command => command.Body).MaximumLength(50000);
        RuleFor(command => command.Slug).MaximumLength(200);
        RuleFor(command => command.Category).MaximumLength(50);
        RuleFor(command => command.VideoUrl).MaximumLength(1000);
        RuleFor(command => command.Summary).MaximumLength(1000);
        RuleFor(command => command.ChangeNote).MaximumLength(500);
        RuleFor(command => command.ModifiedBy).NotEmpty();
        RuleFor(command => command.EndAt).GreaterThan(command => command.StartAt).When(command => command.StartAt.HasValue && command.EndAt.HasValue);
    }
}

public sealed class ArchiveContentBlockCommandValidator : AbstractValidator<ArchiveContentBlockCommand>
{
    public ArchiveContentBlockCommandValidator() => RuleFor(command => command.Id).NotEmpty();
}

public sealed class DeleteContentBlockCommandValidator : AbstractValidator<DeleteContentBlockCommand>
{
    public DeleteContentBlockCommandValidator() => RuleFor(command => command.Id).NotEmpty();
}

public sealed class PublishContentBlockCommandValidator : AbstractValidator<PublishContentBlockCommand>
{
    public PublishContentBlockCommandValidator() => RuleFor(command => command.Id).NotEmpty();
}

public sealed class ToggleContentBlockCommandValidator : AbstractValidator<ToggleContentBlockCommand>
{
    public ToggleContentBlockCommandValidator() => RuleFor(command => command.Id).NotEmpty();
}

public sealed class UnpublishContentBlockCommandValidator : AbstractValidator<UnpublishContentBlockCommand>
{
    public UnpublishContentBlockCommandValidator() => RuleFor(command => command.Id).NotEmpty();
}

public sealed class ReorderContentBlocksCommandValidator : AbstractValidator<ReorderContentBlocksCommand>
{
    public ReorderContentBlocksCommandValidator()
    {
        RuleFor(command => command.Placement).NotEmpty().MaximumLength(100);
        RuleFor(command => command.OrderedIds).NotEmpty();
        RuleForEach(command => command.OrderedIds).NotEmpty();
    }
}

public sealed class RestoreContentVersionCommandValidator : AbstractValidator<RestoreContentVersionCommand>
{
    public RestoreContentVersionCommandValidator()
    {
        RuleFor(command => command.ContentBlockId).NotEmpty();
        RuleFor(command => command.VersionId).NotEmpty();
        RuleFor(command => command.ModifiedBy).NotEmpty();
    }
}

public sealed class CreateCouponCommandValidator : AbstractValidator<CreateCouponCommand>
{
    public CreateCouponCommandValidator()
    {
        RuleFor(command => command.Code).NotEmpty().MaximumLength(50);
        RuleFor(command => command.DiscountType).NotEmpty().Must(type => type is "Fixed" or "Percent");
        RuleFor(command => command.DiscountValue).GreaterThan(0);
        RuleFor(command => command.MinOrderAmount).GreaterThanOrEqualTo(0);
        RuleFor(command => command.UsageLimit).GreaterThan(0);
        RuleFor(command => command.ValidUntil).GreaterThan(command => command.ValidFrom);
    }
}

public sealed class UpdateCouponCommandValidator : AbstractValidator<UpdateCouponCommand>
{
    public UpdateCouponCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
        RuleFor(command => command.DiscountValue).GreaterThan(0);
        RuleFor(command => command.MinOrderAmount).GreaterThanOrEqualTo(0);
        RuleFor(command => command.UsageLimit).GreaterThan(0);
        RuleFor(command => command.ValidUntil).GreaterThan(command => command.ValidFrom);
    }
}

public sealed class DeleteCouponCommandValidator : AbstractValidator<DeleteCouponCommand>
{
    public DeleteCouponCommandValidator() => RuleFor(command => command.Id).NotEmpty();
}

public sealed class FreezeStockCommandValidator : AbstractValidator<FreezeStockCommand>
{
    public FreezeStockCommandValidator()
    {
        RuleFor(command => command.VariantId).NotEmpty();
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.Quantity).GreaterThan(0);
    }
}

public sealed class ReleaseStockCommandValidator : AbstractValidator<ReleaseStockCommand>
{
    public ReleaseStockCommandValidator()
    {
        RuleFor(command => command.VariantId).NotEmpty();
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.Quantity).GreaterThan(0);
    }
}

public sealed class UpdateInventoryCommandValidator : AbstractValidator<UpdateInventoryCommand>
{
    public UpdateInventoryCommandValidator()
    {
        RuleFor(command => command.ProductId).NotEmpty();
        RuleFor(command => command.VariantId).NotEmpty();
        RuleFor(command => command.TotalStock).GreaterThanOrEqualTo(0);
        RuleFor(command => command.AvailableStock).GreaterThanOrEqualTo(0).LessThanOrEqualTo(command => command.TotalStock);
    }
}

public sealed class UploadMediaCommandValidator : AbstractValidator<UploadMediaCommand>
{
    public UploadMediaCommandValidator()
    {
        RuleFor(command => command.FileStream).NotNull();
        RuleFor(command => command.FileName).NotEmpty().MaximumLength(255);
        RuleFor(command => command.MimeType).NotEmpty().MaximumLength(100);
        RuleFor(command => command.Folder).MaximumLength(100);
        RuleFor(command => command.AltText).MaximumLength(500);
    }
}

public sealed class UpdateMediaCommandValidator : AbstractValidator<UpdateMediaCommand>
{
    public UpdateMediaCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
        RuleFor(command => command.AltText).MaximumLength(500);
        RuleFor(command => command.Folder).MaximumLength(100);
    }
}

public sealed class DeleteMediaCommandValidator : AbstractValidator<DeleteMediaCommand>
{
    public DeleteMediaCommandValidator() => RuleFor(command => command.Id).NotEmpty();
}

public sealed class BulkDeleteMediaCommandValidator : AbstractValidator<BulkDeleteMediaCommand>
{
    public BulkDeleteMediaCommandValidator()
    {
        RuleFor(command => command.Ids).NotEmpty();
        RuleForEach(command => command.Ids).NotEmpty();
    }
}

public sealed class TrackMediaUsageCommandValidator : AbstractValidator<TrackMediaUsageCommand>
{
    public TrackMediaUsageCommandValidator()
    {
        RuleFor(command => command.FilePath).NotEmpty().MaximumLength(1000);
        RuleFor(command => command.EntityType).NotEmpty().MaximumLength(100);
        RuleFor(command => command.EntityId).NotEmpty();
        RuleFor(command => command.FieldName).NotEmpty().MaximumLength(100);
    }
}

public sealed class MarkNotificationReadCommandValidator : AbstractValidator<MarkNotificationReadCommand>
{
    public MarkNotificationReadCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.NotificationId).NotEmpty().When(command => !command.MarkAll);
    }
}

public sealed class CreateOrderCommandValidator : AbstractValidator<CreateOrderCommand>
{
    public CreateOrderCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.CouponCode).MaximumLength(50);
    }
}

public sealed class CancelOrderCommandValidator : AbstractValidator<CancelOrderCommand>
{
    public CancelOrderCommandValidator()
    {
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.UserId).NotEmpty();
    }
}

public sealed class ProcessPaymentCommandValidator : AbstractValidator<ProcessPaymentCommand>
{
    public ProcessPaymentCommandValidator()
    {
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.Method).NotEmpty().MaximumLength(50);
    }
}

public sealed class CreatePreOrderCommandValidator : AbstractValidator<CreatePreOrderCommand>
{
    public CreatePreOrderCommandValidator()
    {
        RuleFor(command => command.UserId).NotEmpty();
        RuleFor(command => command.VariantId).NotEmpty();
        RuleFor(command => command.Quantity).GreaterThan(0);
    }
}

public sealed class CancelPreOrderCommandValidator : AbstractValidator<CancelPreOrderCommand>
{
    public CancelPreOrderCommandValidator()
    {
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.UserId).NotEmpty();
    }
}

public sealed class MarkArrivalCommandValidator : AbstractValidator<MarkArrivalCommand>
{
    public MarkArrivalCommandValidator()
    {
        RuleFor(command => command.VariantId).NotEmpty();
        RuleFor(command => command.ArrivalStock).GreaterThan(0);
    }
}

public sealed class CreateProductCommandValidator : AbstractValidator<CreateProductCommand>
{
    public CreateProductCommandValidator()
    {
        RuleFor(command => command.Name).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Description).MaximumLength(5000);
        RuleFor(command => command.Category).NotEmpty().MaximumLength(50);
        RuleFor(command => command.ImageUrl).MaximumLength(1000);
        RuleFor(command => command.Variants).NotEmpty().WithMessage("At least one variant is required.");
        RuleForEach(command => command.Variants).ChildRules(variant =>
        {
            variant.RuleFor(item => item.Sku).MaximumLength(100);
            variant.RuleFor(item => item.SpecName).NotEmpty().MaximumLength(100);
            variant.RuleFor(item => item.Price).GreaterThan(0);
            variant.RuleFor(item => item.TotalStock).GreaterThanOrEqualTo(0);
        });
    }
}

public sealed class UpdateProductCommandValidator : AbstractValidator<UpdateProductCommand>
{
    public UpdateProductCommandValidator()
    {
        RuleFor(command => command.Id).NotEmpty();
        RuleFor(command => command.Name).NotEmpty().MaximumLength(200);
        RuleFor(command => command.Description).MaximumLength(5000);
        RuleFor(command => command.Category).NotEmpty().MaximumLength(50);
        RuleFor(command => command.ImageUrl).MaximumLength(1000);
        RuleFor(command => command.Status).NotEmpty().MaximumLength(50);
        RuleFor(command => command.Variants).NotEmpty().WithMessage("At least one variant is required.");
        RuleForEach(command => command.Variants).ChildRules(variant =>
        {
            variant.RuleFor(item => item.Sku).MaximumLength(100);
            variant.RuleFor(item => item.SpecName).NotEmpty().MaximumLength(100);
            variant.RuleFor(item => item.Price).GreaterThan(0);
            variant.RuleFor(item => item.Status).NotEmpty().MaximumLength(50);
            variant.RuleFor(item => item.TotalStock).GreaterThanOrEqualTo(0).When(item => item.TotalStock.HasValue);
        });
    }
}

public sealed class CreateShipmentCommandValidator : AbstractValidator<CreateShipmentCommand>
{
    public CreateShipmentCommandValidator()
    {
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.Carrier).NotEmpty().MaximumLength(100);
        RuleFor(command => command.TrackingNo).MaximumLength(100);
    }
}

public sealed class MarkDeliveredCommandValidator : AbstractValidator<MarkDeliveredCommand>
{
    public MarkDeliveredCommandValidator() => RuleFor(command => command.OrderId).NotEmpty();
}

public sealed class UpdateTrackingCommandValidator : AbstractValidator<UpdateTrackingCommand>
{
    public UpdateTrackingCommandValidator()
    {
        RuleFor(command => command.OrderId).NotEmpty();
        RuleFor(command => command.TrackingNo).MaximumLength(100);
    }
}
