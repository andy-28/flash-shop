# Database

PostgreSQL is managed through EF Core migrations. The development database is named `flashshop`, with local credentials defined in `backend/src/FlashShop.Api/appsettings.Development.json`.

Core areas:

- Catalog: products, product variants
- Inventory: stock counters with optimistic concurrency
- Checkout: carts, orders, payments, shipments
- Governance: coupons, audit logs
