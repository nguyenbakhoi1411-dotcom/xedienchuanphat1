import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { BankReconciliation, ReconciliationStatus } from '../entities';

@Injectable()
export class BankReconciliationRepository extends Repository<BankReconciliation> {
  constructor(private dataSource: DataSource) {
    super(BankReconciliation, dataSource.createEntityManager());
  }

  async findByPeriod(bankAccountId: string, period: string): Promise<BankReconciliation | null> {
    return this.findOne({
      where: { bankAccountId, period },
      relations: ['bankAccount'],
    });
  }

  async findLatestPeriod(bankAccountId: string): Promise<BankReconciliation | null> {
    return this.findOne({
      where: { bankAccountId },
      relations: ['bankAccount'],
      order: { period: 'DESC' },
    });
  }

  async findOpenReconciliations(bankAccountId: string): Promise<BankReconciliation[]> {
    return this.find({
      where: { bankAccountId, status: ReconciliationStatus.OPEN },
      relations: ['bankAccount'],
      order: { period: 'DESC' },
    });
  }

  async findAllByAccount(bankAccountId: string): Promise<BankReconciliation[]> {
    return this.find({
      where: { bankAccountId },
      relations: ['bankAccount'],
      order: { period: 'DESC' },
    });
  }

  async findByStatus(status: ReconciliationStatus): Promise<BankReconciliation[]> {
    return this.find({
      where: { status },
      relations: ['bankAccount'],
      order: { period: 'DESC' },
    });
  }
}
