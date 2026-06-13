import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { FinancialReportService } from './services/financial-report.service';
import { GeneralLedgerDataService } from './common/services/general-ledger-data.service';
import { SalesReportService } from './services/sales-report.service';
import { PurchaseReportService } from './services/purchase-report.service';
import { InventoryReportService } from './services/inventory-report.service';
import { PayrollReportService } from './services/payroll-report.service';
import { GeneralLedgerService } from './services/general-ledger.service';
import { GLAccount } from '@/entities/accounting/gl-account.entity';
import { GLEntry } from '@/entities/accounting/gl-entry.entity';
import { JournalEntry } from '@/entities/accounting/journal-entry.entity';
import { JournalEntryLine } from '@/entities/accounting/journal-entry-line.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GLAccount,
      GLEntry,
      JournalEntry,
      JournalEntryLine,
      // Add other entities as needed for reports
    ]),
  ],
  controllers: [ReportsController],
  providers: [
    FinancialReportService,
    GeneralLedgerDataService,
    SalesReportService,
    PurchaseReportService,
    InventoryReportService,
    PayrollReportService,
    GeneralLedgerService,
  ],
  exports: [
    FinancialReportService,
    GeneralLedgerDataService,
    SalesReportService,
    PurchaseReportService,
    InventoryReportService,
    PayrollReportService,
    GeneralLedgerService,
  ],
})
export class ReportsModule {}
