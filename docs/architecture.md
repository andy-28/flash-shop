# Architecture

FlashShop follows Clean Architecture:

- Domain contains entities, enums, and value objects only.
- Application contains CQRS commands, queries, DTOs, interfaces, exceptions, and behaviors.
- Infrastructure contains EF Core persistence, Redis cache, repositories, and infrastructure services.
- Api hosts controllers, middleware, SignalR hubs, and background job entry points.

Project references flow inward and keep Application independent from Infrastructure.
