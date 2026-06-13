# Chuan Phat Frontend Layout

Next.js + TypeScript + Tailwind CSS layout for Chuan Phat Business Management System.

## Structure

```text
frontend/
  src/
    app/
      (auth)/login/page.tsx
      (auth)/forgot-password/page.tsx
      (dashboard)/layout.tsx
      (dashboard)/dashboard/page.tsx
      (dashboard)/*/page.tsx
      layout.tsx
      providers.tsx
      globals.css
    components/
      auth/PermissionGuard.tsx
      layout/AppShell.tsx
      layout/Sidebar.tsx
      layout/Header.tsx
      layout/Breadcrumbs.tsx
      layout/UserMenu.tsx
      layout/NotificationButton.tsx
      layout/ModulePage.tsx
      ui/Button.tsx
    features/auth/
      LoginForm.tsx
      api.ts
      schemas.ts
      types.ts
    features/dashboard/
      api.ts
      hooks.ts
      types.ts
      DashboardFilters.tsx
      KpiCard.tsx
      RevenueByMonthChart.tsx
      RevenueByBranchChart.tsx
      TopProductsTable.tsx
      WarrantyTicketsTable.tsx
      DashboardSkeleton.tsx
    features/products/
      api.ts
      hooks.ts
      schemas.ts
      types.ts
      productOptions.ts
      ProductFilters.tsx
      ProductTable.tsx
      ProductFormModal.tsx
    features/inventory/
      api.ts
      hooks.ts
      schemas.ts
      types.ts
      inventoryOptions.ts
      InventoryTabs.tsx
      InventoryFilters.tsx
      InventoryStockTable.tsx
      InventoryHistoryTable.tsx
      StockActionModal.tsx
    features/sales/
      api.ts
      hooks.ts
      schemas.ts
      types.ts
      cartStore.ts
      ProductGrid.tsx
      CartPanel.tsx
      PaymentForm.tsx
      CustomerSelectModal.tsx
    features/customers/
      api.ts
      hooks.ts
      schemas.ts
      types.ts
      customerOptions.ts
      CustomerFilters.tsx
      CustomerTable.tsx
      CustomerFormModal.tsx
      CustomerDetailDrawer.tsx
    features/service/
      api.ts
      hooks.ts
      schemas.ts
      types.ts
      serviceOptions.ts
      WarrantyCheckPanel.tsx
      ServiceFilters.tsx
      ServiceTicketTable.tsx
      ServiceTicketDetailDrawer.tsx
      CreateServiceTicketModal.tsx
    features/accounting/
      api.ts
      hooks.ts
      schemas.ts
      types.ts
      accountingOptions.ts
      AccountingTabs.tsx
      AccountingKpiCard.tsx
      AccountingFilters.tsx
      AccountingOverviewPanel.tsx
      VoucherTable.tsx
      VoucherFormModal.tsx
      DebtTable.tsx
      CashFlowChart.tsx
    features/users/
      api.ts
      hooks.ts
      schemas.ts
      types.ts
      userOptions.ts
      UserFilters.tsx
      UserTable.tsx
      UserFormModal.tsx
      RoleManagementPanel.tsx
      PermissionMatrix.tsx
    constants/navigation.ts
    lib/api/
      axios.ts
      errors.ts
    lib/auth/token.ts
    lib/cn.ts
    lib/mock-auth.ts
    store/uiStore.ts
    types/
```

## Features

- Login layout.
- Login form with React Hook Form, Zod validation, Axios API call, loading state, remember me, forgot password and toast notification.
- Main layout with left sidebar and top header.
- Responsive sidebar drawer on mobile.
- Active menu by current route.
- Breadcrumb by pathname.
- User menu with mock user.
- Notification icon.
- Mock permission guard.
- Orange/white professional UI.
- Reusable button and module page shell.
- Dashboard with KPI cards, Recharts charts, branch/time filters, loading skeleton and empty states.
- Product Management with search/filter/pagination, modal create/edit/view, soft delete confirmation and serial list.
- Inventory Management with stock by branch/product, low-stock filter, import/export/transfer/count actions and transaction history.
- Sales/POS with product search, customer selection, vehicle serial selection, cart, voucher discount, payment methods, invoice creation and print action.
- Customer CRM with search/filter, customer form, detail drawer tabs, purchase/warranty history, care notes and reminders.
- Warranty & Service Ticket with warranty check, ticket table, status badge, create modal, detail drawer, timeline, technician assignment and repair cost items.
- Accounting Basic with financial KPI cards, receipts, payments, receivable/payable debt table, cash fund, bank account, profit/loss summary and cash flow chart.
- User & Permission with employee table, create/edit modal, account lock/unlock confirmation, role management and module permission matrix.

## Run

```powershell
cd frontend
npm install
npm run dev
```

Optional environment:

```text
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_ENABLE_MOCK=false
NEXT_PUBLIC_ENABLE_MOCK_LOGIN=false
```

Mock login works with:

```text
manager@chuanphat.vn / password
0900000000 / password
```

Only set `NEXT_PUBLIC_ENABLE_MOCK_LOGIN=true` for local demo login. Production must keep both mock flags false.

## Production build on Linux/VPS

Do not upload or commit `node_modules` or `.next` from Windows. Next.js uses OS-specific native packages such as SWC, so the server must install dependencies itself.

```bash
cd frontend
rm -rf node_modules .next
npm install
npm run typecheck
npm run build
```

Keep `package-lock.json` in source control. It locks dependency versions while still allowing npm to install the correct optional native package for the current OS, including `@next/swc-linux-x64-gnu` on Linux x64 GNU systems.

Open:

```text
http://localhost:3000
```

Useful routes:

```text
/login
/dashboard
/branches
/products
/inventory
/sales
/customers
/warranty
/suppliers
/accounting
/reports
/hr
/marketing
/settings
```
