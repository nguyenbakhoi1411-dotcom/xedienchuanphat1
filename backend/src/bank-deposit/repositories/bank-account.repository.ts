import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BankAccount } from '../entities';

@Injectable()
export class BankAccountRepository extends Repository<BankAccount> {
  constructor(private dataSource: DataSource) {
    super(BankAccount, dataSource.createEntityManager());
  }

  async findByAccountNo(branchId: string, accountNo: string): Promise<BankAccount | null> {
    return this.findOne({
      where: { branchId, accountNo },
    });
  }

  async findActiveBranchAccounts(branchId: string): Promise<BankAccount[]> {
    return this.find({
      where: { branchId, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAllAccounts(branchId: string): Promise<BankAccount[]> {
    return this.find({
      where: { branchId },
      order: { createdAt: 'DESC' },
    });
  }
}
