import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';
import { User } from '@/entities/user.entity';
import { FinancialReportService } from './services/financial-report.service';
import { SalesReportService } from './services/sales-report.service';
import { PurchaseReportService } from './services/purchase-report.service';
import { InventoryReportService } from './services/inventory-report.service';
import { PayrollReportService } from './services/payroll-report.service';
import { GeneralLedgerService } from './services/general-ledger.service';
import {
  BalanceSheetRequestDto,
  IncomeStatementRequestDto,
  CashFlowRequestDto,
  PeriodSelectorDto,
} from './dto/financial.dto';
import { ReportGroup } from './dto/common.dto';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private readonly financialReportService: FinancialReportService,
    private readonly salesReportService: SalesReportService,
    private readonly purchaseReportService: PurchaseReportService,
    private readonly inventoryReportService: InventoryReportService,
    private readonly payrollReportService: PayrollReportService,
    private readonly generalLedgerService: GeneralLedgerService,
  ) {}

  // ============ REPORT HUB ============

  /**
   * GET /reports/hub
   * Lấy danh sách tất cả báo cáo (với tùy chọn lọc theo nhóm)
   */
  @Get('hub')
  async getReportHub(
    @Query('group') group?: ReportGroup,
    @CurrentUser() user?: User,
  ) {
    const reports = [
      {
        id: 'balance-sheet',
        name: 'Bảng cân đối kế toán',
        description: 'B01-DN - Chi tiết tài sản, nợ phải trả, vốn chủ sở hữu',
        category: 'Báo cáo tài chính',
        group: 'financial',
        icon: 'BarChart3',
      },
      {
        id: 'income-statement',
        name: 'Báo cáo kết quả hoạt động',
        description: 'B02-DN - Doanh thu, chi phí, lợi nhuận chi tiết',
        category: 'Báo cáo tài chính',
        group: 'financial',
        icon: 'TrendingUp',
      },
      {
        id: 'cash-flow',
        name: 'Báo cáo lưu chuyển tiền tệ',
        description: 'B03-DN - Phương pháp trực tiếp và gián tiếp',
        category: 'Báo cáo tài chính',
        group: 'financial',
        icon: 'DollarSign',
      },
      {
        id: 'general-ledger',
        name: 'Sổ cái',
        description: 'Chi tiết tất cả giao dịch theo tài khoản',
        category: 'Báo cáo tổng hợp',
        group: 'general_ledger',
        icon: 'BookOpen',
      },
      {
        id: 'trial-balance',
        name: 'Bảng cân đối số phát sinh',
        description: 'Tóm tắt số phát sinh và số dư của các tài khoản',
        category: 'Báo cáo tổng hợp',
        group: 'general_ledger',
        icon: 'BarChart3',
      },
      {
        id: 'sales-product',
        name: 'Bán hàng theo hàng hóa',
        description: 'Chi tiết bán hàng theo từng sản phẩm/dịch vụ',
        category: 'Báo cáo bán hàng',
        group: 'sales',
        icon: 'ShoppingCart',
      },
      {
        id: 'sales-customer',
        name: 'Bán hàng theo khách hàng',
        description: 'Tổng hợp bán hàng theo từng khách hàng',
        category: 'Báo cáo bán hàng',
        group: 'sales',
        icon: 'Users',
      },
      {
        id: 'inventory-summary',
        name: 'Tình hình tồn kho',
        description: 'Tóm tắt tồn kho tại ngày báo cáo',
        category: 'Báo cáo kho hàng',
        group: 'inventory',
        icon: 'Package',
      },
      {
        id: 'low-stock',
        name: 'Hàng hóa dưới mức tối thiểu',
        description: 'Danh sách hàng hóa cần bổ sung',
        category: 'Báo cáo kho hàng',
        group: 'inventory',
        icon: 'AlertCircle',
      },
      {
        id: 'receivables-aging',
        name: 'Phân tích công nợ phải thu',
        description: 'Phân bổ công nợ theo độ tuổi khoản nợ',
        category: 'Báo cáo phải thu',
        group: 'receivables',
        icon: 'DollarSign',
      },
      {
        id: 'payroll-summary',
        name: 'Tổng hợp bảng lương',
        description: 'Tóm tắt chi lương theo bộ phận',
        category: 'Báo cáo lương',
        group: 'payroll',
        icon: 'Users',
      },
    ];

    if (group && group !== 'all') {
      return {
        reports: reports.filter((r) => r.group === group),
        total: reports.filter((r) => r.group === group).length,
      };
    }

    return {
      reports,
      total: reports.length,
    };
  }

  /**
   * GET /reports/info/:reportId
   * Lấy thông tin chi tiết về một báo cáo
   */
  @Get('info/:reportId')
  async getReportInfo(@Param('reportId') reportId: string) {
    return {
      id: reportId,
      name: 'Report Name',
      description: 'Report description',
      // ... more details
    };
  }

  // ============ FINANCIAL REPORTS ============

  /**
   * GET /reports/financial/balance-sheet
   * B01-DN: Lấy bảng cân đối kế toán
   */
  @Get('financial/balance-sheet')
  async getBalanceSheet(
    @Query('asOf') asOf: string,
    @Query('compareTo') compareTo?: string,
    @CurrentUser() user?: User,
  ) {
    return this.financialReportService.getBalanceSheet(asOf, compareTo);
  }

  /**
   * GET /reports/financial/income-statement
   * B02-DN: Lấy báo cáo kết quả hoạt động
   */
  @Get('financial/income-statement')
  async getIncomeStatement(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('compareFrom') compareFrom?: string,
    @Query('compareTo') compareTo?: string,
    @CurrentUser() user?: User,
  ) {
    return this.financialReportService.getIncomeStatement(
      from,
      to,
      compareFrom,
      compareTo,
    );
  }

  /**
   * GET /reports/financial/cash-flow
   * B03-DN: Lấy báo cáo lưu chuyển tiền tệ
   */
  @Get('financial/cash-flow')
  async getCashFlow(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('method') method?: 'direct' | 'indirect',
    @CurrentUser() user?: User,
  ) {
    return this.financialReportService.getCashFlow(from, to, method || 'direct');
  }

  // ============ GENERAL LEDGER ============

  /**
   * GET /reports/general-ledger/ledger
   * Lấy sổ cái chi tiết
   */
  @Get('general-ledger/ledger')
  async getGeneralLedger(
    @Query('accountCode') accountCode: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentUser() user?: User,
  ) {
    return this.generalLedgerService.getGeneralLedger(accountCode, from, to);
  }

  /**
   * GET /reports/general-ledger/trial-balance
   * Lấy bảng cân đối số phát sinh
   */
  @Get('general-ledger/trial-balance')
  async getTrialBalance(
    @Query('asOf') asOf: string,
    @Query('level') level?: number,
    @CurrentUser() user?: User,
  ) {
    return this.generalLedgerService.getTrialBalance(asOf, level);
  }

  // ============ SALES REPORTS ============

  /**
   * GET /reports/sales/by-product
   */
  @Get('sales/by-product')
  async getSalesByProduct(
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentUser() user?: User,
  ) {
    return this.salesReportService.getSalesByProduct(from, to);
  }

  /**
   * GET /reports/sales/by-customer
   */
  @Get('sales/by-customer')
  async getSalesByCustomer(
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentUser() user?: User,
  ) {
    return this.salesReportService.getSalesByCustomer(from, to);
  }

  /**
   * GET /reports/sales/trend
   */
  @Get('sales/trend')
  async getSalesTrend(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('interval') interval?: string,
    @CurrentUser() user?: User,
  ) {
    return this.salesReportService.getSalesTrend(from, to, interval || 'day');
  }

  // ============ PURCHASE REPORTS ============

  /**
   * GET /reports/purchase/by-vendor
   */
  @Get('purchase/by-vendor')
  async getPurchaseByVendor(
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentUser() user?: User,
  ) {
    return this.purchaseReportService.getPurchaseByVendor(from, to);
  }

  /**
   * GET /reports/purchase/detail
   */
  @Get('purchase/detail')
  async getPurchaseDetail(
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentUser() user?: User,
  ) {
    return this.purchaseReportService.getPurchaseDetail(from, to);
  }

  // ============ INVENTORY REPORTS ============

  /**
   * GET /reports/inventory/summary
   */
  @Get('inventory/summary')
  async getInventorySummary(
    @Query('asOf') asOf: string,
    @CurrentUser() user?: User,
  ) {
    return this.inventoryReportService.getInventorySummary(asOf);
  }

  /**
   * GET /reports/inventory/stock-card/:productId
   */
  @Get('inventory/stock-card/:productId')
  async getStockCard(
    @Param('productId') productId: string,
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentUser() user?: User,
  ) {
    return this.inventoryReportService.getStockCard(productId, from, to);
  }

  /**
   * GET /reports/inventory/low-stock
   */
  @Get('inventory/low-stock')
  async getLowStockItems(@CurrentUser() user?: User) {
    return this.inventoryReportService.getLowStockItems();
  }

  // ============ RECEIVABLES REPORTS ============

  /**
   * GET /reports/receivables/summary
   */
  @Get('receivables/summary')
  async getReceivablesSummary(
    @Query('from') from: string,
    @Query('to') to: string,
    @CurrentUser() user?: User,
  ) {
    return this.generalLedgerService.getReceivablesSummary(from, to);
  }

  /**
   * GET /reports/receivables/aging
   */
  @Get('receivables/aging')
  async getAgingReport(
    @Query('asOf') asOf: string,
    @CurrentUser() user?: User,
  ) {
    return this.generalLedgerService.getAgingReport(asOf);
  }

  // ============ PAYROLL REPORTS ============

  /**
   * GET /reports/payroll/summary
   */
  @Get('payroll/summary')
  async getPayrollSummary(
    @Query('period') period: string,
    @CurrentUser() user?: User,
  ) {
    return this.payrollReportService.getPayrollSummary(period);
  }

  /**
   * GET /reports/payroll/slip
   */
  @Get('payroll/slip')
  async getPayrollSlip(
    @Query('employeeId') employeeId: string,
    @Query('period') period: string,
    @CurrentUser() user?: User,
  ) {
    return this.payrollReportService.getPayrollSlip(employeeId, period);
  }

  /**
   * GET /reports/payroll/insurance
   */
  @Get('payroll/insurance')
  async getInsuranceSummary(
    @Query('period') period: string,
    @CurrentUser() user?: User,
  ) {
    return this.payrollReportService.getInsuranceSummary(period);
  }

  // ============ FAVORITES ============

  /**
   * GET /reports/favorites
   * Lấy danh sách báo cáo yêu thích
   */
  @Get('favorites')
  async getFavoriteReports(@CurrentUser() user: User) {
    // Implementation: Get user's favorite reports from database
    return [];
  }

  /**
   * POST /reports/favorites/:reportId/toggle
   * Thêm/xóa báo cáo khỏi yêu thích
   */
  @Post('favorites/:reportId/toggle')
  @HttpCode(HttpStatus.NO_CONTENT)
  async toggleFavorite(
    @Param('reportId') reportId: string,
    @CurrentUser() user: User,
  ) {
    // Implementation: Toggle favorite status
  }

  // ============ DEADLINES ============

  /**
   * GET /reports/deadlines
   * Lấy danh sách thời hạn nộp báo cáo
   */
  @Get('deadlines')
  async getDeadlines() {
    return [
      {
        id: 'vat-deadline',
        name: 'Nộp tờ khai thuế GTGT',
        dueDate: '2026-07-20',
        description: 'Thông tư 200/2014/TT-BTC',
        priority: 'high',
      },
      {
        id: 'income-tax-deadline',
        name: 'Nộp báo cáo TNDN',
        dueDate: '2026-07-31',
        description: 'Quyết định 02/2001/QĐ-BTC',
        priority: 'high',
      },
      {
        id: 'financial-statement-deadline',
        name: 'Công bố báo cáo tài chính',
        dueDate: '2026-08-15',
        description: 'Chuẩn mực Kế toán Việt Nam',
        priority: 'medium',
      },
      {
        id: 'insurance-deadline',
        name: 'Báo cáo bảo hiểm xã hội',
        dueDate: '2026-08-10',
        description: 'Luật Bảo hiểm Xã hội',
        priority: 'medium',
      },
    ];
  }

  // ============ EXPORT ============

  /**
   * POST /reports/export/:reportId
   * Xuất báo cáo (Excel, PDF, CSV)
   */
  @Post('export/:reportId')
  async exportReport(
    @Param('reportId') reportId: string,
    @Query('format') format: 'excel' | 'pdf' | 'csv',
    @Body() filters?: any,
    @Res() res?: Response,
  ) {
    // Implementation: Generate and return file
    res?.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res?.setHeader('Content-Disposition', `attachment; filename="${reportId}.xlsx"`);
  }

  /**
   * POST /reports/email/:reportId
   * Gửi báo cáo qua email
   */
  @Post('email/:reportId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async sendReportEmail(
    @Param('reportId') reportId: string,
    @Body('to') to: string[],
    @Body('format') format: 'excel' | 'pdf' | 'both',
    @CurrentUser() user?: User,
  ) {
    // Implementation: Send email with report attachment
  }
}
