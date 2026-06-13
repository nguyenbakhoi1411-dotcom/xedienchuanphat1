import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankDepositController } from './bank-deposit.controller';
import { BankDepositService } from './bank-deposit.service';
import { BankAccount, BankTransaction, BankReconciliation } from './entities';
import {
  BankAccountRepository,
  BankTransactionRepository,
  BankReconciliationRepository,
} from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([BankAccount, BankTransaction, BankReconciliation])],
  controllers: [BankDepositController],
  providers: [
    BankDepositService,
    BankAccountRepository,
    BankTransactionRepository,
    BankReconciliationRepository,
  ],
  exports: [BankDepositService],
})
export class BankDepositModule {}
