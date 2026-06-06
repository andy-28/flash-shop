using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace FlashShop.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    private ISender? _mediator;
    protected ISender Mediator => _mediator ??= HttpContext.RequestServices.GetRequiredService<ISender>();

    protected IActionResult OkResponse<T>(T data, string? message = null)
        => Ok(ApiResponse<T>.Ok(data, message, HttpContext.TraceIdentifier));

    protected IActionResult CreatedResponse<T>(T data, string? message = null)
        => StatusCode(StatusCodes.Status201Created, ApiResponse<T>.Ok(data, message, HttpContext.TraceIdentifier));

    protected IActionResult OkMessage(string message)
        => Ok(ApiResponse.Ok(message, HttpContext.TraceIdentifier));

    protected IActionResult AcceptedResponse<T>(T data, string? message = null)
        => StatusCode(StatusCodes.Status202Accepted, ApiResponse<T>.Ok(data, message, HttpContext.TraceIdentifier));
}
