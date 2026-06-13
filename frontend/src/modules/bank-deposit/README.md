# Bank Deposit Module (Tiền gửi - Nghiệp vụ tiền mặt)

## 📋 Overview

The Bank Deposit module is a comprehensive banking transaction management system that handles cash deposits, withdrawals, and bank account reconciliation. It provides a full-stack implementation with NestJS backend, React frontend, and MySQL database.

**Module Name:** `BankDepositModule`  
**Routes:** `/bank-deposit`  
**Frontend Route:** `/operations/bank-deposit`

## 📁 Directory Structure

### Backend Structure
```
backend/src/bank-deposit/
├── entities/                    # TypeORM entities
│   ├── bank-account.entity.ts   # Bank account definition
│   ├── bank-transaction.entity.ts # Transaction definition
│   ├── bank-reconciliation.entity.ts # Reconciliation definition
│   └── index.ts
├── dto/                         # Data Transfer Objects
│   ├── bank-account.dto.ts      # Account DTOs
│   ├── bank-transaction.dto.ts  # Transaction DTOs
│   ├── bank-reconciliation.dto.ts # Reconciliation DTOs
│   └── index.ts
├── repositories/                # Database repositories
│   ├── bank-account.repository.ts
│   ├── bank-transaction.repository.ts
│   ├── bank-reconciliation.repository.ts
│   └── index.ts
├── bank-deposit.service.ts      # Business logic
├── bank-deposit.controller.ts   # API endpoints
├── bank-deposit.module.ts       # NestJS module
└── index.ts

backend/src/database/migrations/
└── 2025-06-13-create-bank-deposit-tables.sql # Database schema
```

### Frontend Structure
```
frontend/src/modules/bank-deposit/
├── types/
│   └── index.ts                 # TypeScript types
├── api/
│   └── bank-deposit.api.ts      # API client
├── hooks/
│   └── index.ts                 # React Query hooks
├── forms/
│   ├── BankReceiptForm.tsx      # Receipt form
│   ├── BankPaymentForm.tsx      # Payment form
│   └── index.ts
├── components/
│   ├── OpsPanel.tsx             # Operations panel
│   ├── ReportPanel.tsx          # Reports list
│   ├── OpsNavBar.tsx            # Navigation tabs
│   ├── BannerStrip.tsx          # Promotional banners
│   └── index.ts
└── index.ts
```

## 🗄️ Database Schema

### Tables

#### `bank_accounts`
Stores information about bank accounts.
```sql
- id: UUID (Primary Key)
- branch_id: UUID (branch reference)
- account_no: VARCHAR(30) - Account number
- account_name: VARCHAR(200) - Account name
- bank_name: VARCHAR(100) - Bank name
- bank_branch: VARCHAR(200)
- currency: CHAR(3) - Default: VND
- accounting_code: VARCHAR(20) - GL code
- opening_balance: DECIMAL(18,2)
- current_balance: DECIMAL(18,2) - Automatically updated
- is_active: BOOLEAN
- notes: TEXT
- created_at, updated_at, created_by, updated_by
```

#### `bank_transactions`
Stores all bank deposits and withdrawals.
```sql
- id: UUID (Primary Key)
- branch_id: UUID
- type: ENUM('RECEIPT', 'PAYMENT')
- sub_type: VARCHAR(50) - e.g., 'Báo có', 'Chi đề nghị'
- doc_no: VARCHAR(30) - Document number (e.g., BC-202506-0001)
- doc_date: DATE
- bank_account_id: UUID (Foreign Key)
- amount: DECIMAL(18,2)
- currency: CHAR(3) - Default: VND
- exchange_rate: DECIMAL(10,4) - Default: 1
- amount_vnd: DECIMAL(18,2) - Auto-calculated
- description: TEXT
- partner_type: ENUM('CUSTOMER', 'SUPPLIER', 'EMPLOYEE')
- partner_id: UUID
- debit_account: VARCHAR(20) - GL debit account
- credit_account: VARCHAR(20) - GL credit account
- status: ENUM('DRAFT', 'POSTED', 'CANCELLED') - Default: DRAFT
- posted_at, posted_by: Audit info
- ref_doc_id: UUID - Reference to related document
- created_at, updated_at, created_by, updated_by
```

#### `bank_reconciliations`
Stores reconciliation records for bank statements.
```sql
- id: UUID (Primary Key)
- bank_account_id: UUID (Foreign Key)
- period: CHAR(7) - Format: YYYY-MM
- statement_balance: DECIMAL(18,2) - From bank statement
- book_balance: DECIMAL(18,2) - Calculated from transactions
- difference: DECIMAL(18,2) - Generated/calculated
- status: ENUM('OPEN', 'MATCHED', 'CLOSED')
- reconciled_at, reconciled_by: Audit info
- notes: TEXT
- created_at, updated_at
```

## 🔌 API Endpoints

### Bank Accounts
- `GET /bank-deposit/accounts` - List all accounts
- `GET /bank-deposit/accounts/:id` - Get specific account
- `POST /bank-deposit/accounts` - Create new account
- `PUT /bank-deposit/accounts/:id` - Update account
- `DELETE /bank-deposit/accounts/:id` - Deactivate account

### Transactions
- `POST /bank-deposit/receipts` - Create receipt
- `POST /bank-deposit/payments` - Create payment
- `GET /bank-deposit/transactions` - List transactions (with filters)
- `GET /bank-deposit/transactions/:id` - Get transaction
- `PUT /bank-deposit/transactions/:id` - Update draft transaction
- `POST /bank-deposit/transactions/:id/post` - Post transaction
- `POST /bank-deposit/transactions/:id/cancel` - Cancel transaction

### Reconciliation
- `GET /bank-deposit/reconciliation/:accountId/:period` - Get reconciliation
- `POST /bank-deposit/reconciliation/:accountId/:period` - Create/update reconciliation
- `GET /bank-deposit/reconciliation/:accountId/latest` - Get latest reconciliation

### Reports
- `GET /bank-deposit/reports/daily-summary` - Daily summary
- `GET /bank-deposit/reports/account-balance` - Account balances
- `GET /bank-deposit/reports/pending-transactions` - Pending transactions
- `GET /bank-deposit/reports/reconciliation-status` - Reconciliation status
- `GET /bank-deposit/reports/transaction-audit` - Audit trail

## 🎨 Frontend Components

### OpsPanel
Displays workflow diagram with two main operations:
- **Thu tiền (Receipts)**: 5 dropdown options
- **Chi tiền (Payments)**: 6 dropdown options

Props:
```tsx
interface OpsPanelProps {
  onNodeClick?: (nodeId: string, itemValue: string) => void;
}
```

### ReportPanel
Lists 5 key reports with icons and counts:
1. Tóm tắt hàng ngày (Daily Summary)
2. Số dư tài khoản (Account Balance)
3. Chứng từ chưa hạch toán (Pending Transactions)
4. Trạng thái đối chiếu (Reconciliation Status)
5. Lịch sử biến động (Audit Trail)

### OpsNavBar
Navigation tabs for filtering:
- Tất cả (All)
- Hôm nay (Today)
- Tuần này (This Week)
- Tháng này (This Month)
- Khác (Other)

### BannerStrip
Promotional banners with CTA:
- AMIS System banner
- Banking Integration banner

### Forms
- **BankReceiptForm**: Create cash receipts with validation
- **BankPaymentForm**: Create cash payments with balance check

## 🔑 Key Features

### Document Number Generation
- Format: `{Type}-{YYYYMM}-{Sequence}`
- Receipt: `BC-202506-0001`
- Payment: `BN-202506-0001`
- Auto-incremented by type and date

### Transaction Workflow
1. **DRAFT** - Initial state, can edit/delete
2. **POSTED** - Locked, updates account balance
3. **CANCELLED** - Closed state, for audit trail

### Account Balance Management
- Opening balance on account creation
- Updated automatically when transactions are posted
- Validated before payment posting
- Calculated from cumulative posted transactions

### Reconciliation
- Period-based (YYYY-MM format)
- Automatic calculation of book balance
- Three statuses: OPEN, MATCHED, CLOSED
- Difference tracking (Statement - Book)

### Role-Based Access Control
- ADMIN: Full access
- KE_TOAN (Accountant): Create/post transactions
- KE_TOAN_TRUONG (Head Accountant): Review/approve
- BRANCH_MANAGER: Branch-specific access
- READ_ONLY: View only

## 🚀 Usage Guide

### Backend Integration

1. **Import the module** in your main `AppModule`:
```typescript
import { BankDepositModule } from './bank-deposit/bank-deposit.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    BankDepositModule, // Add this
    // ... other modules
  ],
})
export class AppModule {}
```

2. **Run the database migration**:
```bash
mysql -u root -p < src/database/migrations/2025-06-13-create-bank-deposit-tables.sql
```

3. **Use the service**:
```typescript
import { BankDepositService } from './bank-deposit/bank-deposit.service';

constructor(private bankDepositService: BankDepositService) {}

async createReceipt() {
  return this.bankDepositService.createBankReceipt(branchId, dto, userId);
}
```

### Frontend Integration

1. **Import the page**:
```typescript
// In your routing configuration
import BankDepositPage from '@/app/(dashboard)/operations/bank-deposit/page';

// Add to routes
{ path: 'operations/bank-deposit', component: BankDepositPage }
```

2. **Use the hooks**:
```typescript
import { useBankAccounts, useCreateBankReceipt } from '@/modules/bank-deposit/hooks';

function MyComponent() {
  const { data: accounts } = useBankAccounts();
  const { mutate: createReceipt } = useCreateBankReceipt();
}
```

3. **Use the API client**:
```typescript
import { bankDepositAPI } from '@/modules/bank-deposit/api';

const receipt = await bankDepositAPI.createBankReceipt({
  bankAccountId: '...',
  subType: 'bao-co',
  docDate: '2025-06-13',
  amount: 1000000,
  debitAccount: '1101',
  creditAccount: '5110',
});
```

## 🎯 Color Scheme

- **Primary**: `#F97316` (Orange-500) - Main actions, headers
- **Success**: `#16A34A` (Green-600) - Receipts, positive balance
- **Warning**: `#D97706` (Amber-600) - Pending items
- **Danger**: `#DC2626` (Red-600) - Payments, errors
- **Info**: `#2563EB` (Blue-600) - Information

## ⌨️ Keyboard Shortcuts

- `Ctrl+S` - Save form
- `Ctrl+Enter` - Save and create new
- `Esc` - Cancel form

## 📊 Dashboard Layout

The page uses a responsive two-column layout:
- **Left (70%)**: Operations panel + Forms
- **Right (30%)**: Reports panel

On mobile, stacks vertically.

## 🔐 Authentication

All endpoints require JWT token with:
- Valid `branchId` in token
- Appropriate role/permissions
- 8-hour expiry
- Refresh tokens (7-day rotation)

Example header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚠️ Validation Rules

### Bank Account
- Account number: 3-30 characters, unique per branch
- Amount: Must be positive
- Account code: 2-20 characters

### Transactions
- Date: Must be valid date
- Amount: Must be positive
- Accounts: 2-20 characters each
- Payment: Current balance must be >= amount

### Reconciliation
- Period: Format YYYY-MM
- Statement balance: Must be provided
- Book balance: Auto-calculated from posted transactions

## 📝 Notes

- All amounts in decimal with 2 decimal places
- Exchange rates default to 1 (for VND)
- Timestamps in UTC
- Audit trails preserved for all changes
- Soft deletes: Use `is_active = false` instead of deleting

## 🔄 Transaction Lifecycle

```
DRAFT → (Edit/Delete OK) → POSTED → (Locked) → (Audit trail)
   ↓                                    ↓
   └─→ CANCELLED (any time)           └─ RECONCILED
```

## 📦 Dependencies

### Backend
- NestJS 10+
- TypeORM 0.3+
- MySQL/MariaDB 8+
- class-validator
- class-transformer

### Frontend
- React 18+
- Next.js 15+
- TypeScript 5+
- React Hook Form
- React Query
- Tailwind CSS
- Zod (validation)
- Lucide React (icons)

## 🐛 Common Issues

1. **Account not found** - Ensure branch_id matches user's branch
2. **Insufficient funds** - Check account balance before payment
3. **Doc number conflict** - Check for duplicate doc numbers in DB
4. **Reconciliation not matching** - Verify posted transactions

## 📞 Support

For issues or questions about the Bank Deposit module:
1. Check the API documentation
2. Review database schema
3. Check validation rules
4. Review error messages

---

**Last Updated:** 2025-06-13  
**Version:** 1.0.0  
**Maintainer:** DevOps Team
