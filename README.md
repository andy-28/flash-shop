# FlashShop

FlashShop is a high-order-volume ecommerce simulation platform that has evolved into a full-stack commerce, CMS, community, and admin SaaS-style project.

## Features

- JWT authentication with PBKDF2 password hashing
- Product, SKU, inventory, cart, checkout, order, and mock payment flows
- Inventory freeze, release, sold transitions, and inventory logs
- Coupon validation and per-user coupon usage tracking
- CMS content management with draft/publish/archive lifecycle and version history
- Media Library with image upload, folders, metadata, thumbnails, and usage tracking
- Dynamic homepage with hero banners, story circles, flash sale preview, promo, contents, and community blocks
- Contents feed with rich text and YouTube embeds
- Community board with posts, comments, replies, likes, and admin moderation
- Flash sale system with Redis Lua atomic stock deduction and async order persistence
- Redis cache aside for hot product and content data
- Admin dashboard with charts, audit logs, and SignalR realtime updates
- Production Docker Compose stack with PostgreSQL, Redis, API, frontend, and Nginx

## Tech Stack

**Backend:** .NET 8, ASP.NET Core, EF Core, PostgreSQL, Redis, SignalR, MediatR, FluentValidation  
**Frontend:** Next.js 15, React 19, Tailwind CSS, TanStack Query, Zustand, TipTap, Recharts  
**Infrastructure:** Docker Compose, Nginx, GitHub Actions

## Local Development

```bash
# 1. Start infrastructure
cd docker
docker compose up -d

# 2. Run database migrations
cd ../backend/src/FlashShop.Api
dotnet ef database update --project ../FlashShop.Infrastructure

# 3. Start backend
dotnet run --launch-profile http

# 4. Start frontend
cd ../../../frontend
npm install
npm run dev
```

Default local endpoints:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Swagger: http://localhost:5000/swagger
- Admin: `admin@flashshop.dev / Admin123!`

## Production Deployment

Production uses five containers:

- `postgres`
- `redis`
- `api`
- `frontend`
- `nginx`

Uploaded media is stored in the named Docker volume `uploads_data`, so images survive container rebuilds.

### 1. Create Environment File

```bash
cp .env.production.example .env.production
```

Edit `.env.production` and replace every `CHANGE_ME_*` value with strong production secrets.

Required values:

```bash
POSTGRES_PASSWORD=...
REDIS_PASSWORD=...
JWT_SECRET=...
ADMIN_PASSWORD=...
```

`JWT_SECRET` should be at least 32 random characters.

### 2. Start Production Stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

### 3. Verify Health

```bash
curl http://localhost/health
```

Expected response:

```json
{
  "status": "Healthy",
  "checks": [
    { "name": "postgresql", "status": "Healthy" },
    { "name": "redis", "status": "Healthy" }
  ]
}
```

### 4. Verify API and Frontend

```bash
curl http://localhost/api/products
```

Open:

- Frontend: http://localhost
- Admin: http://localhost/admin/dashboard

### 5. Swagger in Production

Swagger is enabled only in Development. In production, Nginx returns `404` for `/swagger`.

```bash
curl http://localhost/swagger
```

## Production Security Notes

- Do not commit `.env.production`.
- JWT secret, database password, Redis password, and admin seed password are read from environment variables.
- Redis uses `requirepass` in production compose.
- Nginx applies rate limits to auth, uploads, flash sale purchase, and general API traffic.
- Nginx adds security headers.
- API CORS origins are controlled by `CORS__AllowedOrigins`.
- Production startup applies EF Core migrations automatically.
- Admin seed password is required in Production.

## CI

GitHub Actions runs:

- Backend restore/build/test
- Frontend install/build
- Backend Docker build
- Frontend Docker build

Workflow file:

```text
.github/workflows/ci.yml
```

## Useful Commands

```bash
# Build backend locally
dotnet build backend/FlashShop.sln -c Release

# Build frontend locally
cd frontend
npm run build

# Build Docker images
docker build -t flashshop-api:test ./backend
docker build -t flashshop-frontend:test ./frontend --build-arg NEXT_PUBLIC_API_URL=http://localhost/api

# Stop production stack
docker compose -f docker-compose.prod.yml --env-file .env.production down
```
