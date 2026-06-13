# Bank Deposit Module - Implementation Guide

## Overview

This guide provides step-by-step instructions for integrating and deploying the Bank Deposit module in your ERP system.

## Prerequisites

- Node.js 18+ and npm 9+
- MySQL 8+ or MariaDB 10.3+
- NestJS 10+ project setup
- Next.js 15+ project setup
- TypeORM configured in your NestJS project

## Backend Setup

### Step 1: Copy Backend Files

Copy the following directories to your NestJS project:
```
backend/src/bank-deposit/ → src/bank-deposit/
backend/src/database/migrations/ → src/database/migrations/
```

### Step 2: Install Dependencies (if not already installed)

```bash
npm install @nestjs/common @nestjs/core typeorm class-validator class-transformer
```

### Step 3: Run Database Migration

```bash
# Option 1: Using MySQL CLI
mysql -u root -p < src/database/migrations/2025-06-13-create-bank-deposit-tables.sql

# Option 2: Using TypeORM migrations (if configured)
npm run typeorm migration:run
```

### Step 4: Import Module in AppModule

```typescript
// src/app.module.ts
import { BankDepositModule } from './bank-deposit/bank-deposit.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    BankDepositModule,
    // ... other modules
  ],
})
export class AppModule {}
```

### Step 5: Add Guards and Decorators (if using auth)

Update `bank-deposit.controller.ts` with your auth implementation:

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';

@Controller('bank-deposit')
@UseGuards(JwtAuthGuard, RoleGuard)
export class BankDepositController {
  // ... controller methods
}
```

### Step 6: Verify Backend

```bash
npm run start:dev

# Test endpoint
curl http://localhost:3000/api/bank-deposit/accounts
```

Expected output: `[]` (empty array or error if auth required)

## Frontend Setup

### Step 1: Copy Frontend Files

Copy to your Next.js project:
```
frontend/src/modules/bank-deposit/ → src/modules/bank-deposit/
```

### Step 2: Install Frontend Dependencies (if not already installed)

```bash
npm install @tanstack/react-query react-hook-form @hookform/resolvers zod lucide-react axios
```

### Step 3: Update Environment Variables

Create or update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AUTH_TOKEN_KEY=authToken
```

### Step 4: Update the Page Route

If your routing structure is different, update:
```
frontend/src/app/(dashboard)/operations/bank-deposit/page.tsx
```

to match your project's routing.

### Step 5: Add UI Components

Ensure your project has Tailwind CSS configured. If using shadcn/ui, add Tabs component:

```bash
npx shadcn-ui@latest add tabs
```

Or update the imports in `bank-deposit.page.tsx` to use your own Tabs component.

### Step 6: Verify Frontend

```bash
npm run dev

# Visit http://localhost:3000/operations/bank-deposit
```

## Integration Checklist

### Backend
- [ ] Module copied to `src/bank-deposit/`
- [ ] Database migration executed
- [ ] Module imported in `AppModule`
- [ ] Environment variables configured
- [ ] Auth guards added (if applicable)
- [ ] API endpoints accessible at `/api/bank-deposit/*`
- [ ] Test API endpoint returns expected data

### Frontend
- [ ] Module copied to `src/modules/bank-deposit/`
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Page route accessible
- [ ] API client configured with correct URL
- [ ] Forms render without errors
- [ ] Can create test transaction

## Configuration Options

### Backend Configuration

#### Database Connection

Update your TypeORM config to include:
```typescript
// src/config/database.config.ts
{
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'erp_db',
  entities: [
    'src/**/*.entity.ts',
    // Bank deposit entities are auto-discovered
  ],
  synchronize: false, // Use migrations
  migrationsRun: true,
}
```

#### Environment Variables

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=erp_db

# JWT Auth
JWT_SECRET=your_secret_key
JWT_EXPIRY=8h
JWT_REFRESH_EXPIRY=7d

# API
API_PORT=3000
API_BASE_URL=http://localhost:3000
```

### Frontend Configuration

#### Update API Base URL

```typescript
// frontend/src/modules/bank-deposit/api/bank-deposit.api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
```

#### Update Auth Token Storage

If using different storage mechanism:

```typescript
// In API interceptors
const token = localStorage.getItem(process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY);
```

## Testing

### Backend Testing

#### Test Account Creation

```bash
curl -X POST http://localhost:3000/api/bank-deposit/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "accountNo": "0123456789",
    "accountName": "Main Checking",
    "bankName": "VietcomBank",
    "accountingCode": "1101",
    "openingBalance": 1000000
  }'
```

#### Test Receipt Creation

```bash
curl -X POST http://localhost:3000/api/bank-deposit/receipts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "bankAccountId": "ACCOUNT_ID",
    "subType": "bao-co",
    "docDate": "2025-06-13",
    "amount": 500000,
    "debitAccount": "1101",
    "creditAccount": "5110"
  }'
```

### Frontend Testing

1. Navigate to `/operations/bank-deposit`
2. Try creating a bank account using the form
3. Create a receipt transaction
4. Check network tab for API calls
5. Verify data appears in the reports panel

## Troubleshooting

### Backend Issues

**Issue: Module not found**
- Ensure files are copied to correct location
- Check module import path
- Verify TypeOrmModule is configured

**Issue: Database migration fails**
- Check MySQL connection
- Verify database exists
- Check user permissions
- Review migration SQL syntax

**Issue: API returns 401 Unauthorized**
- Verify JWT token in request
- Check auth guards configuration
- Verify token not expired

### Frontend Issues

**Issue: API calls fail with CORS error**
- Enable CORS on backend:
```typescript
// In main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
});
```

**Issue: Forms not submitting**
- Check browser console for errors
- Verify API URL in `.env.local`
- Ensure auth token present
- Check network tab

**Issue: Components not styling correctly**
- Verify Tailwind CSS configured
- Check for CSS conflicts
- Ensure shadcn/ui components installed (if using)

## Production Deployment

### Backend

1. **Build**
```bash
npm run build
```

2. **Environment Variables**
```env
NODE_ENV=production
DB_HOST=your_prod_db_host
JWT_SECRET=your_prod_secret
```

3. **Run**
```bash
npm start
```

### Frontend

1. **Build**
```bash
npm run build
```

2. **Environment Variables**
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

3. **Deploy**
```bash
npm start
```

## Database Backup and Recovery

### Backup

```bash
mysqldump -u root -p erp_db > backup-bank-deposit.sql
```

### Recovery

```bash
mysql -u root -p erp_db < backup-bank-deposit.sql
```

## Performance Optimization

### Database Indexes

The migration includes optimal indexes:
- `idx_branch_date` on (branch_id, doc_date)
- `idx_status` on (status)
- `idx_type` on (type, sub_type)
- `idx_doc_no` on (doc_no)
- Unique constraint on (branch_id, doc_no)

### Frontend Caching

React Query automatically caches:
- Bank accounts (invalidated on create/update)
- Transactions (invalidated on post/cancel)
- Reconciliations (invalidated on reconcile)

Adjust cache times if needed:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});
```

## Security Considerations

1. **Validate all inputs** - DTOs have validation rules
2. **Enforce branch isolation** - Service filters by branchId
3. **Audit all changes** - Use audit log table
4. **Protect sensitive endpoints** - Use role-based guards
5. **Sanitize output** - API returns only necessary fields
6. **Use HTTPS in production**
7. **Implement rate limiting**
8. **Keep tokens short-lived** (8 hours)

## Support and Maintenance

### Regular Maintenance

- Monitor database size
- Archive old transactions quarterly
- Review audit logs regularly
- Update dependencies monthly

### Monitoring

- Monitor API response times
- Track error rates
- Monitor database query performance
- Track JWT token usage

### Documentation

- Keep README updated
- Document any customizations
- Document deployment procedures
- Document known issues

---

**Version:** 1.0.0  
**Last Updated:** 2025-06-13
