using System.Text;
using System.Text.Json.Serialization;
using FlashShop.Api.BackgroundJobs;
using FlashShop.Api.Hubs;
using FlashShop.Api.Middleware;
using FlashShop.Api.Services;
using FlashShop.Application.Auth.Commands;
using FlashShop.Application.Common.Behaviors;
using FlashShop.Application.Common.Interfaces;
using FlashShop.Infrastructure;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<FlashShop.Api.Filters.ValidationFilter>();
})
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultCors", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddMediatR(configuration =>
    configuration.RegisterServicesFromAssembly(typeof(RegisterCommand).Assembly));
builder.Services.AddValidatorsFromAssembly(typeof(RegisterCommand).Assembly);
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(AuditLogBehavior<,>));
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<ICacheStatusService, CacheStatusService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddSignalR();
builder.Services.AddHostedService<OrderTimeoutJob>();

var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "this-is-a-dev-secret-key-at-least-32-chars!!";
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<CacheHeaderMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("DefaultCors");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<DashboardHub>("/hubs/dashboard");

await DevAdminSeeder.SeedAsync(app);

app.Run();

public partial class Program;
