'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  ShoppingCart,
  Package,
  DollarSign,
  Users,
  PieChart,
  TrendingUp,
} from 'lucide-react';
import {
  ReportCard,
  SearchBar,
  TabFilter,
  ReportGrid,
  DeadlineWidget,
  RecentReportsSection,
  ReportItem,
  ReportGroup,
  DeadlineItem,
} from '../components';
import { useReportList, useFavoriteReports, useRecentReports, useUpcomingDeadlines, useToggleFavorite } from '../hooks';

// Mock report data for R0 (Report Hub)
const MOCK_REPORTS: ReportItem[] = [
  // Financial Reports (Tài chính)
  {
    id: 'balance-sheet',
    name: 'Bảng cân đối kế toán',
    description: 'Bảng cân đối kế toán (B01-DN) - Thành phố Hồ Chí Minh',
    category: 'Báo cáo tài chính',
    icon: <BarChart3 size={24} />,
    isFavorite: false,
    lastUsed: 'Hôm qua',
  },
  {
    id: 'income-statement',
    name: 'Báo cáo kết quả hoạt động',
    description: 'Báo cáo kết quả kinh doanh (B02-DN) - Chi tiết theo bộ phận',
    category: 'Báo cáo tài chính',
    icon: <TrendingUp size={24} />,
    isFavorite: true,
    lastUsed: 'Tuần trước',
  },
  {
    id: 'cash-flow',
    name: 'Báo cáo lưu chuyển tiền tệ',
    description: 'Báo cáo lưu chuyển tiền tệ (B03-DN) - Phương pháp trực tiếp',
    category: 'Báo cáo tài chính',
    icon: <DollarSign size={24} />,
    isFavorite: false,
    lastUsed: 'Tháng trước',
  },
  {
    id: 'footnotes',
    name: 'Thuyết minh báo cáo tài chính',
    description: 'Thuyết minh báo cáo tài chính (B09-DN)',
    category: 'Báo cáo tài chính',
    icon: <BookOpen size={24} />,
    isFavorite: false,
  },

  // General Ledger Reports (Tổng hợp)
  {
    id: 'general-ledger',
    name: 'Sổ cái',
    description: 'Chi tiết tất cả các giao dịch theo tài khoản',
    category: 'Báo cáo tổng hợp',
    icon: <BookOpen size={24} />,
    isFavorite: false,
  },
  {
    id: 'trial-balance',
    name: 'Bảng cân đối số phát sinh',
    description: 'Tổng hợp các tài khoản có phát sinh',
    category: 'Báo cáo tổng hợp',
    icon: <BarChart3 size={24} />,
    isFavorite: false,
  },

  // Sales Reports (Bán hàng)
  {
    id: 'sales-product',
    name: 'Bán hàng theo hàng hóa',
    description: 'Chi tiết bán hàng theo từng sản phẩm/dịch vụ',
    category: 'Báo cáo bán hàng',
    icon: <ShoppingCart size={24} />,
    isFavorite: false,
  },
  {
    id: 'sales-customer',
    name: 'Bán hàng theo khách hàng',
    description: 'Tổng hợp bán hàng theo từng khách hàng',
    category: 'Báo cáo bán hàng',
    icon: <Users size={24} />,
    isFavorite: false,
  },

  // Inventory Reports (Kho hàng)
  {
    id: 'inventory-summary',
    name: 'Tình hình tồn kho',
    description: 'Tóm tắt tồn kho tại ngày báo cáo',
    category: 'Báo cáo kho hàng',
    icon: <Package size={24} />,
    isFavorite: false,
  },
  {
    id: 'low-stock',
    name: 'Hàng hóa dưới mức tối thiểu',
    description: 'Danh sách hàng hóa cần bổ sung',
    category: 'Báo cáo kho hàng',
    icon: <Package size={24} />,
    isFavorite: false,
  },

  // Receivables Reports (Phải thu)
  {
    id: 'receivables-aging',
    name: 'Phân tích công nợ phải thu',
    description: 'Phân bổ công nợ theo độ tuổi khoản nợ',
    category: 'Báo cáo phải thu',
    icon: <DollarSign size={24} />,
    isFavorite: false,
  },

  // Payroll Reports (Lương)
  {
    id: 'payroll-summary',
    name: 'Tổng hợp bảng lương',
    description: 'Tóm tắt chi lương theo bộ phận',
    category: 'Báo cáo lương',
    icon: <Users size={24} />,
    isFavorite: false,
  },
];

// Mock deadlines
const MOCK_DEADLINES: DeadlineItem[] = [
  {
    id: 'deadline-1',
    name: 'Nộp tờ khai thuế GTGT',
    dueDate: '2026-07-20',
    description: 'Thông tư 200/2014/TT-BTC',
    priority: 'high',
  },
  {
    id: 'deadline-2',
    name: 'Nộp báo cáo TNDN',
    dueDate: '2026-07-31',
    description: 'Quyết định 02/2001/QĐ-BTC',
    priority: 'high',
  },
  {
    id: 'deadline-3',
    name: 'Công bố báo cáo tài chính',
    dueDate: '2026-08-15',
    description: 'Chuẩn mực Kế toán Việt Nam',
    priority: 'medium',
  },
  {
    id: 'deadline-4',
    name: 'Báo cáo bảo hiểm xã hội',
    dueDate: '2026-08-10',
    description: 'Luật Bảo hiểm Xã hội',
    priority: 'medium',
  },
];

export function ReportHubPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ReportGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use React Query hooks
  const { data: favoriteReports = [], isLoading: favLoading } = useFavoriteReports();
  const { data: recentReports = [], isLoading: recentLoading } = useRecentReports(5);
  const { data: deadlines = MOCK_DEADLINES, isLoading: deadlineLoading } = useUpcomingDeadlines();
  const toggleFavoriteMutation = useToggleFavorite();

  // Filter reports based on search and tab
  const filteredReports = useMemo(() => {
    let result = MOCK_REPORTS;

    // Filter by tab
    if (activeTab !== 'all') {
      result = result.filter((report) => {
        const categoryMap: Record<ReportGroup, string> = {
          all: '',
          financial: 'Báo cáo tài chính',
          general_ledger: 'Báo cáo tổng hợp',
          sales: 'Báo cáo bán hàng',
          purchase: 'Báo cáo mua hàng',
          inventory: 'Báo cáo kho hàng',
          cash: 'Báo cáo tiền',
          receivables: 'Báo cáo phải thu',
          payables: 'Báo cáo phải trả',
          payroll: 'Báo cáo lương',
          tax: 'Báo cáo thuế',
        };
        return report.category.includes(categoryMap[activeTab]);
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (report) =>
          report.name.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query) ||
          report.category.toLowerCase().includes(query),
      );
    }

    return result;
  }, [activeTab, searchQuery]);

  const handleViewReport = (reportId: string) => {
    // Navigate to specific report page
    const reportPath: Record<string, string> = {
      'balance-sheet': '/reports/financial/balance-sheet',
      'income-statement': '/reports/financial/income-statement',
      'cash-flow': '/reports/financial/cash-flow',
      'general-ledger': '/reports/general-ledger/ledger',
      'trial-balance': '/reports/general-ledger/trial-balance',
      'sales-product': '/reports/sales/by-product',
      'sales-customer': '/reports/sales/by-customer',
      'inventory-summary': '/reports/inventory/summary',
      'low-stock': '/reports/inventory/low-stock',
      'receivables-aging': '/reports/receivables/aging',
      'payroll-summary': '/reports/payroll/summary',
    };

    const path = reportPath[reportId] || `/reports/${reportId}`;
    router.push(path);
  };

  const handleToggleFavorite = (reportId: string) => {
    toggleFavoriteMutation.mutate(reportId);
    // Update local state for optimistic UI
    const index = MOCK_REPORTS.findIndex((r) => r.id === reportId);
    if (index >= 0) {
      MOCK_REPORTS[index].isFavorite = !MOCK_REPORTS[index].isFavorite;
    }
  };

  const recentReportItems = recentReports.map((recent) => {
    const report = MOCK_REPORTS.find((r) => r.id === recent.id);
    return {
      id: recent.id,
      name: report?.name || 'Unknown',
      icon: report?.icon,
      viewedAt: recent.viewedAt,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Trung tâm báo cáo</h1>
          <p className="text-gray-600 mt-1">Quản lý và xem tất cả báo cáo kế toán</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search Bar */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <SearchBar
                placeholder="Tìm kiếm báo cáo theo tên hoặc mô tả..."
                onSearch={setSearchQuery}
              />
            </div>

            {/* Tab Filter */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <TabFilter activeTab={activeTab} onTabChange={setActiveTab} />
            </div>

            {/* Favorites Section */}
            {favoriteReports.length > 0 && (
              <div className="bg-white p-4 rounded-lg border border-blue-200 bg-blue-50">
                <h2 className="text-sm font-semibold text-gray-900 mb-3">⭐ Báo cáo yêu thích</h2>
                <ReportGrid
                  reports={MOCK_REPORTS.filter((r) => r.isFavorite).slice(0, 4)}
                  onView={handleViewReport}
                  onToggleFavorite={handleToggleFavorite}
                  columns={4}
                  isLoading={favLoading}
                />
              </div>
            )}

            {/* Reports Grid */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-900">
                  Tất cả báo cáo ({filteredReports.length})
                </h2>
              </div>
              <ReportGrid
                reports={filteredReports}
                onView={handleViewReport}
                onToggleFavorite={handleToggleFavorite}
                isEmpty={filteredReports.length === 0}
                columns={3}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Deadlines Widget */}
            <DeadlineWidget
              deadlines={deadlines}
              isLoading={deadlineLoading}
              maxItems={4}
            />

            {/* Recent Reports */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Dùng gần đây</h3>
              <RecentReportsSection
                reports={recentReportItems}
                onView={handleViewReport}
                isLoading={recentLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
