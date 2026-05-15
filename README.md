# FlashShop

FlashShop is a learning-oriented high-order-volume ecommerce simulation platform. It uses a Next.js storefront/admin frontend, a .NET 8 Web API backend, PostgreSQL for persistence, Redis for cache-like infrastructure, SignalR for realtime dashboard updates, and Docker Compose for a consistent development environment.

## Tech Stack

- Frontend: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui, React Query, Zustand
- Backend: .NET 8 Web API, EF Core, Npgsql, StackExchange.Redis, SignalR
- Infra: Docker Compose, Nginx, PostgreSQL 16, Redis 7

## Quick Start

```bash
cd docker
docker compose up -d

cd ../backend
dotnet build

cd src/FlashShop.Api
dotnet run

cd ../../../frontend
npm run dev
```

Default local endpoints:

- Frontend: http://localhost:3000
- API Swagger: http://localhost:5000/swagger
- Reverse proxy: http://localhost
