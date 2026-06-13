import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BankDepositService } from './bank-deposit.service';
import {
  CreateBankAccountDto,
  UpdateBankAccountDto,
  CreateBankReceiptDto,
  CreateBankPaymentDto,
  UpdateBankTransactionDto,
  QueryTransactionDto,
  ReconcileDto,
} from './dto';

// Note: Import actual guards from your auth module
// import { JwtAuthGuard, RoleGuard } from '../auth/guards';
// import { Roles } from '../auth/decorators';

@Controller('bank-deposit')
// @UseGuards(JwtAuthGuard, RoleGuard)
export class BankDepositController {
  constructor(private readonly bankDepositService: BankDepositService) {}

  // ============ BANK ACCOUNT ENDPOINTS ============

  /**
   * GET /bank-deposit/accounts
   * Get all bank accounts for the user's branch
   */
  @Get('accounts')
  async getAccounts(
    @Query('includeInactive') includeInactive?: string,
    @Request() req?: any,
  ) {
    const branchId = req?.user?.branchId || 'default-branch';
    return this.bankDepositService.getBankAccounts(branchId, includeInactive === 'true');
  }

  /**
   * GET /bank-deposit/accounts/:id
   * Get a specific bank account
   */
  @Get('accounts/:id')
  async getAccount(@Param('id') id: string) {
    return this.bankDepositService.getBankAccountById(id);
  }

  /**
   * POST /bank-deposit/accounts
   * Create a new bank account
   */
  @Post('accounts')
  @HttpCode(HttpStatus.CREATED)
  async createAccount(
    @Body() createBankAccountDto: CreateBankAccountDto,
    @Request() req?: any,
  ) {
    const branchId = req?.user?.branchId || 'default-branch';
    const userId = req?.user?.id || 'system';
    return this.bankDepositService.createBankAccount(branchId, createBankAccountDto, userId);
  }

  /**
   * PUT /bank-deposit/accounts/:id
   * Update a bank account
   */
  @Put('accounts/:id')
  async updateAccount(
    @Param('id') id: string,
    @Body() updateBankAccountDto: UpdateBankAccountDto,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || 'system';
    return this.bankDepositService.updateBankAccount(id, updateBankAccountDto, userId);
  }

  /**
   * DELETE /bank-deposit/accounts/:id
   * Deactivate a bank account
   */
  @Delete('accounts/:id')
  @HttpCode(HttpStatus.OK)
  async deactivateAccount(@Param('id') id: string, @Request() req?: any) {
    const userId = req?.user?.id || 'system';
    return this.bankDepositService.deactivateBankAccount(id, userId);
  }

  // ============ RECEIPT ENDPOINTS ============

  /**
   * POST /bank-deposit/receipts
   * Create a bank receipt (Thu tiền)
   */
  @Post('receipts')
  @HttpCode(HttpStatus.CREATED)
  async createReceipt(
    @Body() createBankReceiptDto: CreateBankReceiptDto,
    @Request() req?: any,
  ) {
    const branchId = req?.user?.branchId || 'default-branch';
    const userId = req?.user?.id || 'system';
    return this.bankDepositService.createBankReceipt(branchId, createBankReceiptDto, userId);
  }

  // ============ PAYMENT ENDPOINTS ============

  /**
   * POST /bank-deposit/payments
   * Create a bank payment (Chi tiền)
   */
  @Post('payments')
  @HttpCode(HttpStatus.CREATED)
  async createPayment(
    @Body() createBankPaymentDto: CreateBankPaymentDto,
    @Request() req?: any,
  ) {
    const branchId = req?.user?.branchId || 'default-branch';
    const userId = req?.user?.id || 'system';
    return this.bankDepositService.createBankPayment(branchId, createBankPaymentDto, userId);
  }

  // ============ TRANSACTION ENDPOINTS ============

  /**
   * GET /bank-deposit/transactions
   * Get all transactions with filters
   */
  @Get('transactions')
  async getTransactions(
    @Query() queryTransactionDto: QueryTransactionDto,
    @Request() req?: any,
  ) {
    const branchId = req?.user?.branchId || 'default-branch';
    return this.bankDepositService.getTransactions(branchId, queryTransactionDto);
  }

  /**
   * GET /bank-deposit/transactions/:id
   * Get a specific transaction
   */
  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string) {
    return this.bankDepositService.getTransactionById(id);
  }

  /**
   * PUT /bank-deposit/transactions/:id
   * Update a draft transaction
   */
  @Put('transactions/:id')
  async updateTransaction(
    @Param('id') id: string,
    @Body() updateBankTransactionDto: UpdateBankTransactionDto,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || 'system';
    return this.bankDepositService.updateTransaction(id, updateBankTransactionDto, userId);
  }

  /**
   * POST /bank-deposit/transactions/:id/post
   * Post a transaction (change status to POSTED)
   */
  @Post('transactions/:id/post')
  @HttpCode(HttpStatus.OK)
  async postTransaction(@Param('id') id: string, @Request() req?: any) {
    const userId = req?.user?.id || 'system';
    return this.bankDepositService.postTransaction(id, userId);
  }

  /**
   * POST /bank-deposit/transactions/:id/cancel
   * Cancel a draft transaction
   */
  @Post('transactions/:id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelTransaction(@Param('id') id: string, @Request() req?: any) {
    const userId = req?.user?.id || 'system';
    return this.bankDepositService.cancelTransaction(id, userId);
  }

  // ============ RECONCILIATION ENDPOINTS ============

  /**
   * GET /bank-deposit/reconciliation/:accountId/:period
   * Get reconciliation for account and period
   */
  @Get('reconciliation/:accountId/:period')
  async getReconciliation(
    @Param('accountId') accountId: string,
    @Param('period') period: string,
  ) {
    return this.bankDepositService.getReconciliation(accountId, period);
  }

  /**
   * POST /bank-deposit/reconciliation/:accountId/:period
   * Create or update reconciliation
   */
  @Post('reconciliation/:accountId/:period')
  @HttpCode(HttpStatus.OK)
  async reconcile(
    @Param('accountId') accountId: string,
    @Param('period') period: string,
    @Body() reconcileDto: ReconcileDto,
    @Request() req?: any,
  ) {
    const userId = req?.user?.id || 'system';
    return this.bankDepositService.reconcile(accountId, period, reconcileDto, userId);
  }

  /**
   * GET /bank-deposit/reconciliation/:accountId/latest
   * Get latest reconciliation for account
   */
  @Get('reconciliation/:accountId/latest')
  async getLatestReconciliation(@Param('accountId') accountId: string) {
    return this.bankDepositService.getLatestReconciliation(accountId);
  }

  // ============ REPORT ENDPOINTS ============

  /**
   * GET /bank-deposit/reports/daily-summary
   * Daily summary of receipts and payments
   */
  @Get('reports/daily-summary')
  async getDailySummary(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req?: any,
  ) {
    const branchId = req?.user?.branchId || 'default-branch';
    return this.bankDepositService.getTransactions(branchId, {
      startDate,
      endDate,
      limit: 1000,
    });
  }

  /**
   * GET /bank-deposit/reports/account-balance
   * Account balance report
   */
  @Get('reports/account-balance')
  async getAccountBalanceReport(@Request() req?: any) {
    const branchId = req?.user?.branchId || 'default-branch';
    return this.bankDepositService.getBankAccounts(branchId);
  }

  /**
   * GET /bank-deposit/reports/pending-transactions
   * Pending (Draft) transactions report
   */
  @Get('reports/pending-transactions')
  async getPendingTransactions(@Request() req?: any) {
    const branchId = req?.user?.branchId || 'default-branch';
    return this.bankDepositService.getTransactions(branchId, {
      status: 'DRAFT' as any,
      limit: 1000,
    });
  }

  /**
   * GET /bank-deposit/reports/reconciliation-status
   * Reconciliation status report
   */
  @Get('reports/reconciliation-status')
  async getReconciliationStatus() {
    // Implementation would fetch all reconciliations needing attention
    return { message: 'Reconciliation status report' };
  }

  /**
   * GET /bank-deposit/reports/transaction-audit
   * Transaction audit trail
   */
  @Get('reports/transaction-audit')
  async getTransactionAudit(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Request() req?: any,
  ) {
    const branchId = req?.user?.branchId || 'default-branch';
    return this.bankDepositService.getTransactions(branchId, {
      startDate,
      endDate,
      limit: 1000,
    });
  }
}
