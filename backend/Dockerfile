# ============================
# Stage 1: Build
# ============================
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

COPY src/FlashShop.Domain/FlashShop.Domain.csproj src/FlashShop.Domain/
COPY src/FlashShop.Application/FlashShop.Application.csproj src/FlashShop.Application/
COPY src/FlashShop.Infrastructure/FlashShop.Infrastructure.csproj src/FlashShop.Infrastructure/
COPY src/FlashShop.Api/FlashShop.Api.csproj src/FlashShop.Api/
RUN dotnet restore src/FlashShop.Api/FlashShop.Api.csproj

COPY . .
RUN dotnet publish src/FlashShop.Api/FlashShop.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ============================
# Stage 2: Runtime
# ============================
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime
WORKDIR /app

RUN mkdir -p /app/wwwroot/uploads

COPY --from=build /app/publish .

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app/wwwroot/uploads
USER appuser

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "FlashShop.Api.dll"]
