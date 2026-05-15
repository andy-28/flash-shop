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

        context.Result = new BadRequestObjectResult(new
        {
            code = "VALIDATION_ERROR",
            message = "Request validation failed"
        });
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
    }
}
