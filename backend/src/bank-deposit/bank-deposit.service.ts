import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BankAccount, BankTransaction, BankReconciliation, TransactionType, TransactionStatus } from '../entities';
import {
  BankAccountRepository,
  BankTransactionRepository,
  BankReconciliationRepository,
} from '../repositories';
import {
  CreateBankAccountDto,
  UpdateBankAccountDto,
  CreateBankReceiptDto,
  CreateBankPaymentDto,
  UpdateBankTransactionDto,
  QueryTransactionDto,
  ReconcileDto,
} from '../dto';

@Injectable()
export class BankDepositService {
  constructor(
    @InjectRepository(BankAccount)
    private bankAccountRepository: BankAccountRepository,
    @InjectRepository(BankTransaction)
    private bankTransactionRepository: BankTransactionRepository,
    @InjectRepository(BankReconciliation)
    private bankReconciliationRepository: BankReconciliationRepository,
  ) {}

  // ============ BANK ACCOUNT OPERATIONS ============

  /**
   * Create a new bank account
   */
  async createBankAccount(
    branchId: string,
    dto: CreateBankAccountDto,
    userId: string,
  ): Promise<BankAccount> {
    // Check if account already exists
    const existing = await this.bankAccountRepository.findByAccountNo(branchId, dto.accountNo);
    if (existing) {
      throw new ConflictException(
        `Bank account with number ${dto.accountNo} already exists for this branch`,
      );
    }

    const bankAccount = this.bankAccountRepository.create({
      ...dto,
      branchId,
      createdBy: userId,
      currentBalance: dto.openingBalance || 0,
    });

    return this.bankAccountRepository.save(bankAccount);
  }

  /**
   * Get all bank accounts for a branch
   */
  async getBankAccounts(branchId: string, includeInactive = false): Promise<BankAccount[]> {
    if (includeInactive) {
      return this.bankAccountRepository.findAllAccounts(branchId);
    }
    return this.bankAccountRepository.findActiveBranchAccounts(branchId);
  }

  /**
   * Get a specific bank account
   */
  async getBankAccountById(id: string): Promise<BankAccount> {
    const account = await this.bankAccountRepository.findOne({ where: { id } });
    if (!account) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }
    return account;
  }

  /**
   * Update bank account
   */
  async updateBankAccount(
    id: string,
    dto: UpdateBankAccountDto,
    userId: string,
  ): Promise<BankAccount> {
    const account = await this.getBankAccountById(id);
    Object.assign(account, dto, { updatedBy: userId });
    return this.bankAccountRepository.save(account);
  }

  /**
   * Deactivate a bank account
   */
  async deactivateBankAccount(id: string, userId: string): Promise<BankAccount> {
    const account = await this.getBankAccountById(id);

    // Check if there are draft transactions
    const draftTxs = await this.bankTransactionRepository.find({
      where: { bankAccountId: id, status: TransactionStatus.DRAFT },
    });

    if (draftTxs.length > 0) {
      throw new BadRequestException(
        `Cannot deactivate account with ${draftTxs.length} draft transaction(s)`,
      );
    }

    account.isActive = false;
    account.updatedBy = userId;
    return this.bankAccountRepository.save(account);
  }

  // ============ TRANSACTION OPERATIONS ============

  /**
   * Generate document number in format: BC-202506-0001 (receipt) or BN-202506-0001 (payment)
   */
  async generateDocNo(type: TransactionType, subType: string, branchId: string): Promise<string> {
    const prefix = type === TransactionType.RECEIPT ? 'BC' : 'BN';
    const datePrefix = this.getDatePrefix(); // YYYYMM format

    // Find latest doc no with this type and subtype
    const latestDocNo = await this.bankTransactionRepository.findLatestDocNo(
      branchId,
      type,
      subType,
    );

    let sequence = 1;
    if (latestDocNo) {
      const lastSequence = parseInt(latestDocNo.split('-')[2], 10);
      sequence = lastSequence + 1;
    }

    const sequenceStr = String(sequence).padStart(4, '0');
    return `${prefix}-${datePrefix}-${sequenceStr}`;
  }

  /**
   * Create a bank receipt (Thu tiền)
   */
  async createBankReceipt(
    branchId: string,
    dto: CreateBankReceiptDto,
    userId: string,
  ): Promise<BankTransaction> {
    // Validate bank account
    const bankAccount = await this.getBankAccountById(dto.bankAccountId);
    if (bankAccount.branchId !== branchId) {
      throw new BadRequestException('Bank account does not belong to this branch');
    }

    // Generate doc number
    const docNo = await this.generateDocNo(TransactionType.RECEIPT, dto.subType, branchId);

    // Calculate VND amount
    const amountVnd = dto.amount * (dto.exchangeRate || 1);

    const transaction = this.bankTransactionRepository.create({
      ...dto,
      branchId,
      type: TransactionType.RECEIPT,
      docNo,
      amountVnd,
      currency: dto.currency || 'VND',
      exchangeRate: dto.exchangeRate || 1,
      status: TransactionStatus.DRAFT,
      createdBy: userId,
    });

    return this.bankTransactionRepository.save(transaction);
  }

  /**
   * Create a bank payment (Chi tiền)
   */
  async createBankPayment(
    branchId: string,
    dto: CreateBankPaymentDto,
    userId: string,
  ): Promise<BankTransaction> {
    // Validate bank account
    const bankAccount = await this.getBankAccountById(dto.bankAccountId);
    if (bankAccount.branchId !== branchId) {
      throw new BadRequestException('Bank account does not belong to this branch');
    }

    // Check account balance for PAYMENT
    if (bankAccount.currentBalance < dto.amount) {
      throw new BadRequestException(
        `Insufficient funds. Current balance: ${bankAccount.currentBalance}, Payment amount: ${dto.amount}`,
      );
    }

    // Generate doc number
    const docNo = await this.generateDocNo(TransactionType.PAYMENT, dto.subType, branchId);

    // Calculate VND amount
    const amountVnd = dto.amount * (dto.exchangeRate || 1);

    const transaction = this.bankTransactionRepository.create({
      ...dto,
      branchId,
      type: TransactionType.PAYMENT,
      docNo,
      amountVnd,
      currency: dto.currency || 'VND',
      exchangeRate: dto.exchangeRate || 1,
      status: TransactionStatus.DRAFT,
      createdBy: userId,
    });

    return this.bankTransactionRepository.save(transaction);
  }

  /**
   * Update a draft transaction
   */
  async updateTransaction(
    id: string,
    dto: UpdateBankTransactionDto,
    userId: string,
  ): Promise<BankTransaction> {
    const transaction = await this.getTransactionById(id);

    // Can only update DRAFT transactions
    if (transaction.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot update ${transaction.status} transaction. Only DRAFT transactions can be updated.`,
      );
    }

    Object.assign(transaction, dto, { updatedBy: userId });

    // Recalculate amountVnd if needed
    if (dto.amount || dto.exchangeRate) {
      transaction.amountVnd = (dto.amount || transaction.amount) * (dto.exchangeRate || transaction.exchangeRate);
    }

    return this.bankTransactionRepository.save(transaction);
  }

  /**
   * Post a transaction (change status to POSTED and update account balance)
   */
  async postTransaction(id: string, userId: string): Promise<BankTransaction> {
    const transaction = await this.getTransactionById(id);

    // Can only post DRAFT transactions
    if (transaction.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot post ${transaction.status} transaction. Only DRAFT transactions can be posted.`,
      );
    }

    // Get bank account
    const bankAccount = await this.getBankAccountById(transaction.bankAccountId);

    // Update account balance
    if (transaction.type === TransactionType.RECEIPT) {
      bankAccount.currentBalance += transaction.amountVnd;
    } else {
      // Payment
      if (bankAccount.currentBalance < transaction.amountVnd) {
        throw new BadRequestException(
          `Insufficient funds to post payment. Current balance: ${bankAccount.currentBalance}`,
        );
      }
      bankAccount.currentBalance -= transaction.amountVnd;
    }

    // Update transaction
    transaction.status = TransactionStatus.POSTED;
    transaction.postedAt = new Date();
    transaction.postedBy = userId;
    transaction.updatedBy = userId;

    // Save both
    await this.bankAccountRepository.save(bankAccount);
    return this.bankTransactionRepository.save(transaction);
  }

  /**
   * Cancel a draft transaction
   */
  async cancelTransaction(id: string, userId: string): Promise<BankTransaction> {
    const transaction = await this.getTransactionById(id);

    if (transaction.status !== TransactionStatus.DRAFT) {
      throw new BadRequestException(
        `Cannot cancel ${transaction.status} transaction. Only DRAFT transactions can be cancelled.`,
      );
    }

    transaction.status = TransactionStatus.CANCELLED;
    transaction.updatedBy = userId;
    return this.bankTransactionRepository.save(transaction);
  }

  /**
   * Get transaction by ID
   */
  async getTransactionById(id: string): Promise<BankTransaction> {
    const transaction = await this.bankTransactionRepository.findOne({
      where: { id },
      relations: ['bankAccount'],
    });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }

  /**
   * Get all transactions with filters
   */
  async getTransactions(
    branchId: string,
    query: QueryTransactionDto,
  ): Promise<{ data: BankTransaction[]; total: number }> {
    const qb = this.bankTransactionRepository.createQueryBuilder('tx')
      .where('tx.branchId = :branchId', { branchId });

    if (query.type) {
      qb.andWhere('tx.type = :type', { type: query.type });
    }

    if (query.status) {
      qb.andWhere('tx.status = :status', { status: query.status });
    }

    if (query.bankAccountId) {
      qb.andWhere('tx.bankAccountId = :bankAccountId', { bankAccountId: query.bankAccountId });
    }

    if (query.startDate && query.endDate) {
      qb.andWhere('tx.docDate BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    }

    qb.leftJoinAndSelect('tx.bankAccount', 'account')
      .orderBy('tx.docDate', 'DESC')
      .addOrderBy('tx.docNo', 'DESC');

    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total };
  }

  // ============ RECONCILIATION OPERATIONS ============

  /**
   * Create or update bank reconciliation
   */
  async reconcile(
    bankAccountId: string,
    period: string,
    dto: ReconcileDto,
    userId: string,
  ): Promise<BankReconciliation> {
    const bankAccount = await this.getBankAccountById(bankAccountId);

    // Find existing reconciliation for this period
    let reconciliation = await this.bankReconciliationRepository.findByPeriod(
      bankAccountId,
      period,
    );

    if (!reconciliation) {
      reconciliation = this.bankReconciliationRepository.create({
        bankAccountId,
        period,
      });
    }

    // Calculate book balance from posted transactions
    const [startYear, startMonth] = period.split('-');
    const startDate = `${startYear}-${startMonth}-01`;
    const endDate = this.getLastDayOfMonth(period);

    const postedTransactions =
      await this.bankTransactionRepository.findPostedTransactionsByAccount(
        bankAccountId,
        startDate,
        endDate,
      );

    let bookBalance = bankAccount.openingBalance;
    for (const tx of postedTransactions) {
      if (tx.type === TransactionType.RECEIPT) {
        bookBalance += tx.amountVnd;
      } else {
        bookBalance -= tx.amountVnd;
      }
    }

    reconciliation.statementBalance = dto.statementBalance;
    reconciliation.bookBalance = bookBalance;

    if (reconciliation.difference === 0) {
      reconciliation.status = 'MATCHED';
      reconciliation.reconciledAt = new Date();
      reconciliation.reconciledBy = userId;
    }

    reconciliation.notes = dto.notes;

    return this.bankReconciliationRepository.save(reconciliation);
  }

  /**
   * Get reconciliation for account and period
   */
  async getReconciliation(bankAccountId: string, period: string): Promise<BankReconciliation> {
    const reconciliation = await this.bankReconciliationRepository.findByPeriod(
      bankAccountId,
      period,
    );
    if (!reconciliation) {
      throw new NotFoundException(
        `Reconciliation for account and period ${period} not found`,
      );
    }
    return reconciliation;
  }

  /**
   * Get latest reconciliation for account
   */
  async getLatestReconciliation(bankAccountId: string): Promise<BankReconciliation | null> {
    return this.bankReconciliationRepository.findLatestPeriod(bankAccountId);
  }

  // ============ UTILITY METHODS ============

  /**
   * Get date prefix in YYYYMM format
   */
  private getDatePrefix(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}${month}`;
  }

  /**
   * Get last day of month for a given period
   */
  private getLastDayOfMonth(period: string): string {
    const [year, month] = period.split('-');
    const nextMonth = parseInt(month) + 1;
    const nextYear = nextMonth > 12 ? parseInt(year) + 1 : parseInt(year);
    const adjustedMonth = nextMonth > 12 ? 1 : nextMonth;

    const lastDay = new Date(nextYear, adjustedMonth, 0);
    return lastDay.toISOString().split('T')[0];
  }
}
