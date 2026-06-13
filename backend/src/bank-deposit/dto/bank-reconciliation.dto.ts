import { IsNotEmpty, IsString, IsNumber, IsOptional, Min, IsEnum } from 'class-validator';
import { ReconciliationStatus } from '../entities/bank-reconciliation.entity';

export class ReconcileDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  period: string; // Format: YYYY-MM

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  statementBalance: number; // Balance from bank statement

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BankReconciliationResponseDto {
  id: string;
  bankAccountId: string;
  period: string;
  statementBalance: number;
  bookBalance: number;
  difference: number;
  status: ReconciliationStatus;
  reconciledAt: Date | null;
  reconciledBy: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
