import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GeneralLedgerDataService } from '../common/services/general-ledger-data.service';

@Injectable()
export class GeneralLedgerService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly glDataService: GeneralLedgerDataService,
  ) {}

  async getGeneralLedger(accountCode: string, from: string, to: string) {
    // TODO: Implement general ledger report
    const movements = await this.glDataService.getAccountMovements(accountCode, from, to);
    return {
      accountCode,
      from,
      to,
      movements,
      total: movements.length,
    };
  }

  async getTrialBalance(asOf: string, level?: number) {
    // TODO: Implement trial balance report
    const trialBalance = await this.glDataService.getTrialBalanceData(asOf, asOf, level);
    return {
      asOf,
      level,
      data: trialBalance,
      total: trialBalance.length,
    };
  }

  async getReceivablesSummary(from: string, to: string) {
    // TODO: Implement receivables summary report
    return {
      from,
      to,
      data: [],
      total: 0,
    };
  }

  async getAgingReport(asOf: string) {
    // TODO: Implement aging report
    return {
      asOf,
      data: [],
    };
  }
}
