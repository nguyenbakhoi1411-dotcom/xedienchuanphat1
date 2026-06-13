# Cash Operations Module - Integration Guide

## Quick Start

### 1. Access the Module
The Cash Operations module is now available at:
```
http://localhost:3000/operations/cash
```

### 2. File Structure
```
frontend/
├── src/
│   ├── app/(dashboard)/operations/cash/
│   │   └── page.tsx                    # Main page component
│   └── features/cash-operations/
│       ├── OperationNode.tsx           # Individual nodes with dropdowns
│       ├── WorkflowDiagram.tsx         # Workflow visualization
│       ├── ReportsList.tsx             # Reports panel
│       ├── BottomNavigation.tsx        # Quick navigation tabs
│       ├── PromoBanner.tsx             # AMIS promotional banner
│       ├── index.ts                    # Barrel exports
│       └── README.md                   # Component documentation
└── CASH_OPERATIONS_PREVIEW.html        # Visual preview (can be opened in browser)
```

## Component Overview

### OperationNode
Renders individual operation nodes with optional dropdown menus.

```tsx
<OperationNode
  label="Thu tiền"
  type="receipt"
  position="top"
  hasDropdown={true}
  dropdownItems={["Phiếu thu", "..."]}
  onItemClick={(item) => console.log(item)}
/>
```

**Props:**
- `label`: Display text
- `type`: "receipt" | "payment" | "audit"
- `position`: "top" | "bottom" | "center"
- `hasDropdown`: Show dropdown button
- `dropdownItems`: Array of menu items
- `onItemClick`: Callback when item selected

### WorkflowDiagram
Shows the workflow flow with Thu tiền → Kiểm kê quỹ ← Chi tiền

```tsx
<WorkflowDiagram 
  onOperationSelect={(operation, type) => {
    // type: "RECEIPT" | "PAYMENT" | "AUDIT"
  }}
/>
```

### ReportsList
Displays available reports with clickable items.

```tsx
<ReportsList 
  onReportSelect={(report) => {
    // Navigate to report or fetch data
  }}
/>
```

### BottomNavigation
Quick access navigation tabs.

```tsx
<BottomNavigation 
  onTabChange={(tabId) => {
    // Handle: "customers" | "suppliers" | "employees" | "options"
  }}
/>
```

### PromoBanner
Promotional banner with CTA button.

```tsx
<PromoBanner 
  onCtaClick={() => {
    // Handle AMIS connection
  }}
/>
```

## Integration Examples

### 1. Route to Operations Module
Update your navigation to include:

```tsx
// In sidebar or navigation menu
<Link href="/operations/cash">
  <i className="fas fa-coins"></i> Nghiệp vụ tiền mặt
</Link>
```

### 2. Handle Operation Selection
```tsx
const handleOperationSelect = (operation: string, type: string) => {
  switch(type) {
    case "RECEIPT":
      router.push(`/cash/receipt?form=${operation}`);
      break;
    case "PAYMENT":
      router.push(`/cash/payment?form=${operation}`);
      break;
    case "AUDIT":
      router.push(`/cash/audit`);
      break;
  }
};
```

### 3. Navigate to Reports
```tsx
const handleReportSelect = (report: string) => {
  // Map report names to report IDs/routes
  const reportMap = {
    "Bảng kê số dư tiền theo ngày": "/reports/cash-balance-daily",
    "Dòng tiền": "/reports/cash-flow",
    // ... more mappings
  };
  
  if (reportMap[report]) {
    router.push(reportMap[report]);
  }
};
```

### 4. Update Navigation Tabs
```tsx
const handleTabChange = (tab: string) => {
  switch(tab) {
    case "customers":
      setActiveFilter({ type: "CUSTOMER" });
      break;
    case "suppliers":
      setActiveFilter({ type: "SUPPLIER" });
      break;
    case "employees":
      setActiveFilter({ type: "EMPLOYEE" });
      break;
    case "options":
      openSettingsModal();
      break;
  }
};
```

## Backend Integration

### API Endpoints to Create/Connect

```typescript
// Cash Operations APIs
GET  /api/cash/operations          // List operations with status
GET  /api/cash/receipts            // Get receipt data
POST /api/cash/receipts            // Create receipt
GET  /api/cash/payments            // Get payment data
POST /api/cash/payments            // Create payment
GET  /api/cash/audit               // Get audit data
POST /api/cash/audit               // Create audit

// Reports APIs
GET  /api/reports/cash-balance     // Daily balance report
GET  /api/reports/cash-flow        // Cash flow report
GET  /api/reports/receipt-journal  // Receipt journal (S03a1)
GET  /api/reports/payment-journal  // Payment journal (S03a2)
GET  /api/reports/cash-ledger      // Detailed ledger

// AMIS Integration
POST /api/integrations/amis/connect // Connect AMIS
GET  /api/integrations/amis/status  // Check connection status
```

## Styling Customization

### Color Scheme
The module uses colors from `tailwind.config.ts`:
- Primary: `#F97316` (orange)
- Background: `#F8FAFC`
- Text: `#1E293B`
- Border: `#E2E8F0`

### Adjust Colors
```tsx
// In OperationNode.tsx or component files
// Change: bg-green-100 → bg-blue-100
// Change: text-green-600 → text-blue-600
// Change: bg-orange-50 → bg-primary/5
```

## Performance Optimization

### For Production
1. **Memoize components** if they receive external data:
```tsx
export const WorkflowDiagram = React.memo(WorkflowDiagramComponent);
```

2. **Lazy load reports list** if large:
```tsx
const ReportsList = dynamic(
  () => import('./ReportsList'),
  { loading: () => <Skeleton /> }
);
```

3. **Add pagination** to reports if more than 10:
```tsx
const [page, setPage] = useState(1);
const visibleReports = reports.slice((page-1)*10, page*10);
```

## Type Definitions

### Create `types.ts` if needed:
```typescript
export type OperationType = "RECEIPT" | "PAYMENT" | "AUDIT";
export type NavigationTab = "customers" | "suppliers" | "employees" | "options";

export interface Operation {
  id: string;
  label: string;
  type: OperationType;
  status: "DRAFT" | "PENDING" | "APPROVED" | "COMPLETED";
}

export interface CashReport {
  id: string;
  name: string;
  type: string;
  lastGenerated?: Date;
}
```

## Testing

### Unit Tests
```tsx
// __tests__/OperationNode.test.tsx
import { render, screen } from '@testing-library/react';
import { OperationNode } from '@/features/cash-operations';

test('renders operation node', () => {
  render(<OperationNode label="Thu tiền" type="receipt" position="top" />);
  expect(screen.getByText('Thu tiền')).toBeInTheDocument();
});

test('shows dropdown items on click', async () => {
  const { user } = render(
    <OperationNode 
      label="Thu tiền" 
      type="receipt" 
      hasDropdown={true}
      dropdownItems={["Phiếu thu"]}
    />
  );
  // Test dropdown functionality
});
```

### Integration Tests
```tsx
// __tests__/CashOperationsPage.test.tsx
test('page renders both panels', () => {
  render(<CashOperationsPage />);
  expect(screen.getByText('NGHIỆP VỰ TIỀN MẶT')).toBeInTheDocument();
  expect(screen.getByText('BÁO CÁO')).toBeInTheDocument();
});
```

## Troubleshooting

### Issue: Components not rendering
- Check that all imports use `@/` alias correctly
- Verify `tsconfig.json` has path aliases configured
- Ensure `use client` directive is at top of file

### Issue: Tailwind classes not working
- Verify content paths in `tailwind.config.ts`
- Run `npm run build` to rebuild Tailwind
- Check for conflicting CSS

### Issue: Dropdowns not appearing
- Ensure z-index is set (current: z-20)
- Check parent overflow settings
- Verify event handlers are attached

### Issue: Navigation not responding
- Check console for JavaScript errors
- Verify `onTabChange` callback is defined
- Check Next.js router is imported correctly

## Future Enhancements

### Planned Features
1. **Real-time balance updates** - WebSocket integration
2. **Operation status indicators** - Visual status badges
3. **Draft recovery** - Auto-save functionality
4. **Bulk operations** - Multiple selections
5. **Custom report builder** - User-defined reports
6. **Mobile app version** - React Native/Flutter
7. **Offline mode** - Service worker integration
8. **Multi-language support** - i18n integration
9. **Dark mode** - Theme switching
10. **Accessibility improvements** - WCAG 2.1 AA compliance

## Support & Documentation

- **Component Preview**: Open `CASH_OPERATIONS_PREVIEW.html` in browser
- **Feature Documentation**: See [README.md](./README.md)
- **API Documentation**: `/docs/api/cash-operations`
- **Design System**: Check Figma link (if available)

## Checklist for Deployment

- [ ] All TypeScript types are defined
- [ ] API endpoints are implemented
- [ ] Navigation routing is configured
- [ ] Permission checks are in place
- [ ] Responsive design tested on mobile/tablet
- [ ] Performance tested (Lighthouse score > 90)
- [ ] Accessibility tested (WCAG 2.1 AA)
- [ ] UI reviewed and approved
- [ ] Documentation updated
- [ ] Tests written and passing
