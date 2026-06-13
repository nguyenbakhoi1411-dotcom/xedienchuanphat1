import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class PurchaseReportService {
  constructor(private readonly dataSource: DataSource) {}

  async getPurchaseByVendor(from: string, to: string) {
    // TODO: Implement purchase by vendor report
    return {
      from,
      to,
      data: [],
      total: 0,
    };
  }

  async getPurchaseDetail(from: string, to: string) {
    // TODO: Implement purchase detail report
    return {
      from,
      to,
      data: [],
      total: 0,
    };
  }
}
