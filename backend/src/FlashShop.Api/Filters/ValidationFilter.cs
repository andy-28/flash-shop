using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace FlashShop.Api.Filters;

public sealed class ValidationFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (context.ModelState.IsValid)
        {
            return;
        }

        var errors = context.ModelState.Values
            .SelectMany(entry => entry.Errors)
            .Select(error => string.IsNullOrWhiteSpace(error.ErrorMessage) ? "Invalid request value" : error.ErrorMessage)
            .ToList();

        context.Result = new BadRequestObjectResult(ApiResponse.Fail(
            "Validation failed",
            errors,
            context.HttpContext.TraceIdentifier));
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}
