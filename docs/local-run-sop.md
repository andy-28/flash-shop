# FlashShop 本機啟動 SOP

這份流程用於 Windows 本機開發環境，前端跑在 `localhost:3000`，後端跑在 `localhost:5000`，資料庫與 Redis 由 Docker 提供。

## 1. 確認必要工具

```powershell
dotnet --version
node --version
npm --version
docker --version
```

建議版本：

- .NET 8 SDK
- Node.js 20+
- Docker Desktop

## 2. 啟動資料庫與 Redis

先啟動 Docker Desktop，等 Docker Engine 完全啟動後執行：

```powershell
cd D:\flash-shop
docker compose -f docker\docker-compose.yml up -d postgres redis
```

不要直接 `up -d` 全部服務，因為 dev compose 裡的 `nginx` 會使用 port 80。若你的 Windows 已有 IIS 或其他服務占用 port 80，nginx 會啟動失敗。開發時只需要 `postgres` 和 `redis`。

確認服務：

```powershell
docker ps
```

應該看到：

```text
flashshop-postgres
flashshop-redis
```

## 3. 套用資料庫 Migration

```powershell
cd D:\flash-shop
dotnet ef database update --project backend\src\FlashShop.Infrastructure --startup-project backend\src\FlashShop.Api
```

如果顯示 `The database is already up to date.`，代表資料庫 schema 已是最新。

## 4. 確認前端 API URL

檢查或建立：

```text
D:\flash-shop\frontend\.env.local
```

內容：

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

如果新增或修改 `.env.local`，必須重啟 frontend dev server。

## 5. 啟動 Backend

開一個 PowerShell 視窗：

```powershell
cd D:\flash-shop\backend\src\FlashShop.Api
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet run --launch-profile http
```

成功時應看到：

```text
Now listening on: http://localhost:5000
```

如果 backend 一閃就退出，通常是 PostgreSQL 或 Redis 沒有先啟動。

## 6. 啟動 Frontend

開第二個 PowerShell 視窗：

```powershell
cd D:\flash-shop\frontend
npm.cmd run dev
```

成功時開啟：

```text
http://localhost:3000
```

## 7. 預設登入帳號

Admin：

```text
Email: admin@flashshop.dev
Password: Admin123!
```

Buyer：

```text
Email: buyer@test.com
Password: Test123!
```

如果 admin 仍登入失敗，通常是舊 DB volume 裡已有舊密碼。可以重設 dev admin 密碼，或刪除 Docker volume 重建資料庫。

## 8. 快速健康檢查

確認 backend：

```powershell
Invoke-RestMethod http://localhost:5000/health
```

測試登入 API：

```powershell
$body = @{ email='admin@flashshop.dev'; password='Admin123!' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -ContentType 'application/json' -Body $body
```

如果 API 成功但前端登入失敗，優先檢查 `frontend\.env.local` 是否為：

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

並重啟 frontend。

## 9. 常見問題

### Docker 沒開

症狀：

- Backend 無法啟動
- 登入失敗
- 首頁只有靜態 hero，沒有商品/CMS 資料

處理：

```powershell
docker compose -f docker\docker-compose.yml up -d postgres redis
```

### port 80 被占用

症狀：

```text
ports are not available: exposing port TCP 0.0.0.0:80
```

處理：

開發模式不要啟動 nginx，只啟動：

```powershell
docker compose -f docker\docker-compose.yml up -d postgres redis
```

### frontend 登入送錯 API

症狀：

- `localhost:5000/api/auth/login` 成功
- 前端畫面登入失敗

處理：

確認 `frontend\.env.local`：

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

然後重啟 `npm.cmd run dev`。

### admin 密碼不對

設定檔預設是：

```text
Admin123!
```

注意 `A` 是大寫。若資料庫已有舊 admin，Seeder 不會覆蓋密碼，需要手動重設或重建 DB volume。


