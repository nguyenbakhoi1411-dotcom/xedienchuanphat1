import { Injectable } from '@nestjs/common';
import { DataSource, Repository, Between } from 'typeorm';
import { BankTransaction, TransactionStatus, TransactionType } from '../entities';

@Injectable()
export class BankTransactionRepository extends Repository<BankTransaction> {
  constructor(private dataSource: DataSource) {
    super(BankTransaction, dataSource.createEntityManager());
  }

  async findByDocNo(branchId: string, docNo: string): Promise<BankTransaction | null> {
    return this.findOne({
      where: { branchId, docNo },
      relations: ['bankAccount'],
    });
  }

  async findByDocNoUnique(docNo: string): Promise<BankTransaction | null> {
    return this.findOne({
      where: { docNo },
      relations: ['bankAccount'],
    });
  }

  async findLatestDocNo(branchId: string, type: TransactionType, subType: string): Promise<string | null> {
    const result = await this.createQueryBuilder('tx')
      .select('tx.docNo', 'docNo')
      .where('tx.branchId = :branchId', { branchId })
      .andWhere('tx.type = :type', { type })
      .andWhere('tx.subType = :subType', { subType })
      .orderBy('tx.docDate', 'DESC')
      .addOrderBy('tx.docNo', 'DESC')
      .limit(1)
      .getRawOne();

    return result?.docNo || null;
  }

  async findTransactionsByDateRange(
    branchId: string,
    startDate: string,
    endDate: string,
    status?: TransactionStatus,
  ): Promise<BankTransaction[]> {
    const query = this.createQueryBuilder('tx')
      .where('tx.branchId = :branchId', { branchId })
      .andWhere('tx.docDate BETWEEN :startDate AND :endDate', { startDate, endDate });

    if (status) {
      query.andWhere('tx.status = :status', { status });
    }

    return query
      .leftJoinAndSelect('tx.bankAccount', 'account')
      .orderBy('tx.docDate', 'DESC')
      .addOrderBy('tx.docNo', 'DESC')
      .getMany();
  }

  async findAccountTransactions(bankAccountId: string, status?: TransactionStatus): Promise<BankTransaction[]> {
    const query = this.createQueryBuilder('tx')
      .where('tx.bankAccountId = :bankAccountId', { bankAccountId })
      .leftJoinAndSelect('tx.bankAccount', 'account');

    if (status) {
      query.andWhere('tx.status = :status', { status });
    }

    return query.orderBy('tx.docDate', 'DESC').addOrderBy('tx.docNo', 'DESC').getMany();
  }

  async findPostedTransactionsByAccount(
    bankAccountId: string,
    startDate: string,
    endDate: string,
  ): Promise<BankTransaction[]> {
    return this.find({
      where: {
        bankAccountId,
        docDate: Between(startDate, endDate),
        status: TransactionStatus.POSTED,
      },
      order: { docDate: 'ASC' },
    });
  }

  async findDraftTransactions(branchId: string): Promise<BankTransaction[]> {
    return this.find({
      where: { branchId, status: TransactionStatus.DRAFT },
      relations: ['bankAccount'],
      order: { docDate: 'DESC' },
    });
  }

  async calculateAccountBalance(bankAccountId: string, upToDate: string): Promise<number> {
    const result = await this.createQueryBuilder('tx')
      .select('SUM(CASE WHEN tx.type = "RECEIPT" THEN tx.amountVnd ELSE -tx.amountVnd END)', 'balance')
      .where('tx.bankAccountId = :bankAccountId', { bankAccountId })
      .andWhere('tx.docDate <= :upToDate', { upToDate })
      .andWhere('tx.status = :status', { status: TransactionStatus.POSTED })
      .getRawOne();

    return parseFloat(result?.balance) || 0;
  }
}
