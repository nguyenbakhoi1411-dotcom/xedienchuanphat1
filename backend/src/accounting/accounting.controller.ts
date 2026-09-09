import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { AccountingService } from './accounting.service';

@Controller('api/accounting')
export class AccountingController {
  constructor(private readonly accountingService: AccountingService) {}

  @Get('advance-settlements')
  getAdvanceSettlements() {
    return this.accountingService.getAdvanceSettlements();
  }

  @Get('other-vouchers')
  getOtherVouchers() {
    return this.accountingService.getOtherVouchers();
  }

  @Post('profit-loss/transfer')
  transferProfitLoss(@Body('period') period: string) {
    return this.accountingService.transferProfitLoss(period || '06/2026');
  }

  @Post('period/close')
  closePeriod(@Body('period') period: string) {
    return this.accountingService.closePeriod(period || '06/2026');
  }

  @Get('reports/financial')
  getFinancialReports() {
    return this.accountingService.getFinancialReports();
  }

  @Get('reports/quick')
  getQuickReports() {
    return this.accountingService.getQuickReports();
  }
}
