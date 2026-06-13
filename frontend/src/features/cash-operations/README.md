# Cash Operations Module (Nghiệp vụ tiền mặt)

## Overview
A comprehensive cash operations management module for Vietnamese ERP systems with workflow visualization, reports management, and quick-access navigation.

## Architecture

### Component Structure
```
src/features/cash-operations/
├── OperationNode.tsx          # Individual operation nodes with dropdown menus
├── WorkflowDiagram.tsx        # Main workflow visualization (Thu tiền → Kiểm kê quỹ ← Chi tiền)
├── ReportsList.tsx            # Reports listing panel
├── BottomNavigation.tsx       # Quick access navigation (Customers, Suppliers, Employees, Settings)
├── PromoBanner.tsx            # AMIS promotional banner with CTA
└── index.ts                   # Barrel export for all components

src/app/(dashboard)/operations/cash/
└── page.tsx                   # Main page with two-column layout (70/30 split)
```

## Features

### Layout
- **Two-column responsive layout**
  - Left panel (70%): Workflow operations
  - Right panel (30%): Reports list
  - Full-width bottom banner: AMIS promotion

### Left Panel - Workflow Diagram
Three operation nodes arranged vertically with visual flow indicators:

1. **Thu tiền (Cash Receipt)** - Top node
   - Green document + coin icon with "THU" label
   - Dropdown menu:
     - Phiếu thu
     - Thu tiền theo hóa đơn
     - Thu tiền theo hóa đơn nhiều khách hàng

2. **Kiểm kê quỹ (Cash Audit)** - Center node
   - Green checkmark document icon
   - Arrows from both Thu tiền and Chi tiền pointing to this node

3. **Chi tiền (Cash Payment)** - Bottom node
   - Green document + coin icon with "CHI" label
   - Dropdown menu:
     - Phiếu chi
     - Chi tiền theo hóa đơn
     - Chi tiền theo hóa đơn nhiều nhà cung cấp

**Arrows**: Visual indicators showing workflow flow (right-pointing arrows)

### Bottom Navigation Bar
Quick access tabs with icons:
- **Khách hàng** (Customers) - Users icon
- **Nhà cung cấp** (Suppliers) - Building icon
- **Nhân viên** (Employees) - User check icon
- **Tùy chọn** (Settings) - Settings icon

Responsive design: Labels hide on mobile, icons remain visible.

### Right Panel - Reports List
Bulleted list of available reports (clickable/navigable):
- Bảng kê số dư tiền theo ngày
- Dòng tiền
- S03a1-DNN: Sổ nhật ký thu tiền
- Sổ kế toán chi tiết quỹ tiền mặt
- S03a2-DNN: Sổ nhật ký chi tiền
- "Tất cả báo cáo" link (teal color, external icon)

### Bottom Banner
- **Background**: Emerald gradient (emerald-600 to emerald-700)
- **Text**: "AMIS Quy trình — Phê duyệt và tự động hóa quy trình chi tiền, tạm ứng"
- **CTA Button**: "Kết nối ngay" (slate-800 background, hover: slate-900)
- **Layout**: Responsive flex (stacked on mobile, row on desktop)

## Color Scheme

### Primary Colors
- **Primary Orange**: #F97316 (hover states, links)
- **Background**: #F8FAFC
- **Text**: #1E293B
- **Border**: #E2E8F0

### Operation Colors
- **Operation Nodes**: Green theme (green-50 background, green-600 text)
- **Dropdown**: White background with hover states using primary orange

### Report Colors
- **List Items**: Text gray with orange hover state
- **"Tất cả báo cáo" Link**: Emerald/teal (#059669)

## Styling
- **Tailwind CSS**: Full responsive design
- **Icons**: Lucide React (FileText, DollarSign, Users, Building2, UserCheck, Settings, ExternalLink, ChevronDown)
- **Shadows**: Using soft shadow from config (shadow-soft)
- **Borders**: Using border-border color throughout
- **Rounded Corners**: Consistent lg border-radius

## Usage

### Access the Module
```
http://localhost:3000/operations/cash
```

### Component Usage
```tsx
import { 
  WorkflowDiagram, 
  ReportsList, 
  BottomNavigation, 
  PromoBanner 
} from "@/features/cash-operations";

// Components are already composed in the main page
```

### Event Handlers
The page provides console logging for:
- Operation selection (logs operation type and name)
- Report selection (logs report name)
- Navigation tab changes (logs active tab)
- CTA button clicks (logs "Kết nối ngay" click)

Can be extended to integrate with:
- Navigation routing
- Report API calls
- Operation workflow APIs
- User preferences storage

## Responsive Behavior
- **Desktop**: Full two-column layout with visible labels
- **Tablet**: Layout maintained, labels may adjust
- **Mobile**: Stack vertically with icon-only navigation
  - Responsive using Tailwind's `sm:` breakpoints
  - Hidden labels on navigation appear with `hidden sm:inline`

## Type Safety
- Full TypeScript support
- Props interfaces for all components
- Type definitions for operation types and positions

## Integration Points
The module is ready for integration with:
1. **Backend APIs**: For fetching real cash operation data
2. **Report Generation**: Navigate to actual report pages
3. **Workflow Management**: Trigger operation workflows
4. **User Preferences**: Save last accessed reports/operations
5. **Analytics**: Track user interactions with operations

## Future Enhancements
- Real-time cash balance updates
- Operation status indicators
- Draft/Pending operation counts
- Recent operations quick view
- Customizable report shortcuts
- User role-based operation visibility
- Operation approval workflows
