import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface GLAccount {
  code: string;
  name: string;
  level: number;
  isDebit: boolean;
  parentCode?: string;
}

export interface GLMovement {
  accountCode: string;
  date: Date;
  voucherNo: string;
  voucherDate: Date;
  description: string;
  counterAccount: string;
  debit: number;
  credit: number;
}

export interface GLBalance {
  accountCode: string;
  beginningDebit: number;
  beginningCredit: number;
  endingDebit: number;
  endingCredit: number;
  movementDebit: number;
  movementCredit: number;
}

/**
 * Service để truy vấn dữ liệu từ Sổ cái (General Ledger)
 * Đây là dữ liệu cơ sở cho tất cả báo cáo tài chính
 */
@Injectable()
export class GeneralLedgerDataService {
  constructor(private dataSource: DataSource) {}

  /**
   * Lấy danh sách tất cả tài khoản GL
   */
  async getGLAccounts(level?: number): Promise<GLAccount[]> {
    let query = `
      SELECT 
        code,
        name,
        level,
        is_debit as isDebit,
        parent_code as parentCode
      FROM gl_accounts
      WHERE is_active = 1
    `;

    if (level) {
      query += ` AND level = ${level}`;
    }

    query += ` ORDER BY code ASC`;

    const accounts = await this.dataSource.query(query);
    return accounts;
  }

  /**
   * Lấy số dư TK tại một ngày cụ thể
   */
  async getAccountBalance(
    accountCode: string,
    asOfDate: Date,
  ): Promise<GLBalance> {
    const query = `
      SELECT 
        account_code as accountCode,
        COALESCE(SUM(CASE WHEN type = 'DEBIT' AND date <= ? THEN amount ELSE 0 END), 0) as totalDebit,
        COALESCE(SUM(CASE WHEN type = 'CREDIT' AND date <= ? THEN amount ELSE 0 END), 0) as totalCredit
      FROM gl_movements
      WHERE account_code = ?
      GROUP BY account_code
    `;

    const result = await this.dataSource.query(query, [asOfDate, asOfDate, accountCode]);
    return result[0] || { accountCode, totalDebit: 0, totalCredit: 0 };
  }

  /**
   * Lấy tất cả phát sinh của một TK trong kỳ
   */
  async getAccountMovements(
    accountCode: string,
    fromDate: Date,
    toDate: Date,
  ): Promise<GLMovement[]> {
    const query = `
      SELECT 
        account_code as accountCode,
        date,
        voucher_no as voucherNo,
        voucher_date as voucherDate,
        description,
        counter_account as counterAccount,
        CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END as debit,
        CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END as credit
      FROM gl_movements
      WHERE account_code = ? 
        AND date BETWEEN ? AND ?
      ORDER BY date ASC, voucher_no ASC
    `;

    const movements = await this.dataSource.query(query, [
      accountCode,
      fromDate,
      toDate,
    ]);

    return movements;
  }

  /**
   * Lấy các TK con (drill-down)
   */
  async getSubAccounts(parentCode: string): Promise<GLAccount[]> {
    const query = `
      SELECT 
        code,
        name,
        level,
        is_debit as isDebit,
        parent_code as parentCode
      FROM gl_accounts
      WHERE parent_code = ? AND is_active = 1
      ORDER BY code ASC
    `;

    return this.dataSource.query(query, [parentCode]);
  }

  /**
   * Lấy tổng số dư của một nhóm TK (parent account + tất cả con)
   */
  async getGroupBalance(
    groupCode: string,
    asOfDate: Date,
  ): Promise<GLBalance> {
    const query = `
      SELECT 
        ? as accountCode,
        COALESCE(SUM(CASE WHEN m.type = 'DEBIT' AND m.date <= ? THEN m.amount ELSE 0 END), 0) as totalDebit,
        COALESCE(SUM(CASE WHEN m.type = 'CREDIT' AND m.date <= ? THEN m.amount ELSE 0 END), 0) as totalCredit
      FROM gl_movements m
      INNER JOIN gl_accounts a ON m.account_code = a.code
      WHERE (a.code = ? OR a.parent_code LIKE ?)
      GROUP BY a.code
    `;

    const result = await this.dataSource.query(query, [
      groupCode,
      asOfDate,
      asOfDate,
      groupCode,
      `${groupCode}%`,
    ]);

    return result[0] || { accountCode: groupCode, totalDebit: 0, totalCredit: 0 };
  }

  /**
   * Lấy tất cả phát sinh trong kỳ với filter
   */
  async getTrialBalanceData(
    fromDate: Date,
    toDate: Date,
    level?: number,
  ): Promise<any[]> {
    let query = `
      SELECT 
        a.code as code,
        a.name as name,
        a.level as level,
        a.is_debit as isDebit,
        COALESCE(SUM(CASE WHEN m.type = 'DEBIT' AND m.date <= ? THEN m.amount ELSE 0 END), 0) as movementDebit,
        COALESCE(SUM(CASE WHEN m.type = 'CREDIT' AND m.date <= ? THEN m.amount ELSE 0 END), 0) as movementCredit
      FROM gl_accounts a
      LEFT JOIN gl_movements m ON a.code = m.account_code AND m.date BETWEEN ? AND ?
      WHERE a.is_active = 1
    `;

    if (level) {
      query += ` AND a.level = ${level}`;
    }

    query += `
      GROUP BY a.code, a.name, a.level, a.is_debit
      ORDER BY a.code ASC
    `;

    return this.dataSource.query(query, [toDate, toDate, fromDate, toDate]);
  }

  /**
   * Tính số dư đầu kỳ (opening balance) của một TK
   * Opening balance = tất cả phát sinh trước fromDate
   */
  async getOpeningBalance(
    accountCode: string,
    fromDate: Date,
  ): Promise<GLBalance> {
    const query = `
      SELECT 
        ? as accountCode,
        COALESCE(SUM(CASE WHEN type = 'DEBIT' AND date < ? THEN amount ELSE 0 END), 0) as openingDebit,
        COALESCE(SUM(CASE WHEN type = 'CREDIT' AND date < ? THEN amount ELSE 0 END), 0) as openingCredit
      FROM gl_movements
      WHERE account_code = ?
    `;

    const result = await this.dataSource.query(query, [
      accountCode,
      fromDate,
      fromDate,
      accountCode,
    ]);

    return result[0] || { accountCode, openingDebit: 0, openingCredit: 0 };
  }

  /**
   * Format số tiền theo đơn vị (VND, Nghìn đồng, Triệu đồng)
   */
  formatCurrency(amount: number, unit: 'VND' | 'thousands' | 'millions'): number {
    switch (unit) {
      case 'thousands':
        return Math.round(amount / 1000);
      case 'millions':
        return Math.round(amount / 1000000);
      case 'VND':
      default:
        return amount;
    }
  }

  /**
   * Chuyển đổi số âm sang format hiển thị (ngoặc đơn)
   */
  formatNegative(value: number): string {
    if (value < 0) {
      return `(${Math.abs(value).toLocaleString('vi-VN')})`;
    }
    return value.toLocaleString('vi-VN');
  }
}
