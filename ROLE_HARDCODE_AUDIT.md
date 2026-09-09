# Role Hard-Code Audit

Date: 2026-09-09

## Scope

Static scan of backend and frontend role/permission literals in:

- `src/main/java`
- `src/test/java`
- `frontend/src`

Commands used:

```powershell
rg -n "hasRole\(|hasAnyRole\(|@PreAuthorize|\bROLE_[A-Z_]+\b|\b(SUPER_ADMIN|ADMIN|DIRECTOR|ACCOUNTANT|BRANCH_MANAGER|WAREHOUSE_STAFF|SALES_STAFF|MARKETING_STAFF|TECHNICIAN|AUDITOR|HR_MANAGER)\b" src/main/java src/test/java
rg -n "SUPER_ADMIN|ADMIN|DIRECTOR|ACCOUNTANT|BRANCH_MANAGER|WAREHOUSE_STAFF|SALES_STAFF|MARKETING_STAFF|TECHNICIAN|AUDITOR|HR_MANAGER|role" frontend/src
```

## Findings

- Backend controller guards mostly use permission literals through `@PreAuthorize("hasAuthority('...')")`. That is expected and should remain aligned with seeded permissions.
- Backend branch scoping has role literals in `BranchSecurity.isAdmin`: `ADMIN` and `SUPER_ADMIN`, plus the `VIEW_ALL_BRANCHES` permission.
- Frontend branch selectors had direct `role === "ADMIN"` checks in sales and serial pages. This excluded `SUPER_ADMIN` and permission-based branch access.
- Frontend role definitions, role options, and role management mock data intentionally contain role literals as domain vocabulary.

## Changes Made

- Added `canViewAllBranches()` in `frontend/src/lib/auth/token.ts`.
- Replaced the sales and serials branch selector checks with permission-aware logic.

## Remaining Follow-Up

- Consider extracting backend role and permission codes into constants or enums in a separate cleanup PR.
- Keep `@PreAuthorize` permission strings covered by `SecurityAnnotationTest` and permission seed tests before doing any broad refactor.
