---
name: models-folder
description: 'Use when creating any new TypeScript interface, type, or enum. Always define them in a file under src/models/ instead of inline in components, services, or other files. Use an existing model file if the type belongs to the same domain, or create a new one.'
---

# Models Folder Convention

## When to Use
Any time you need to define a new:
- `interface`
- `type`
- `enum`

Always place it in `src/models/`. Never define shared types inline inside components, pages, services, queries, or other non-model files.

## Existing Model Files

| File | Domain |
|------|--------|
| `src/models/auth.ts` | Authentication (login, register, tokens) |
| `src/models/user.ts` | Users (AppUser, UserSearchRequest, UserListResponse) |
| `src/models/seller.ts` | Sellers |

## Rules

1. **Add to an existing file** if the type belongs to the same domain.
2. **Create a new file** (e.g., `src/models/market.ts`) if the type belongs to a new domain.
3. **Always export** every type/interface defined in a model file.
4. **Do not define** shared types inside components, pages, services, or queries.

## Example

```ts
// src/models/market.ts
export interface Market {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
}

export interface MarketSearchRequest {
  name: string;
  page: number;
  pageSize: number;
}
```

Then import where needed:

```ts
import type { Market } from "@/models/market";
```
