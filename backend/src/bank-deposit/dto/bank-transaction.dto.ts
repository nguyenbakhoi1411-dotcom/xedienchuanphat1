import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsNumber,
  IsOptional,
  Min,
  IsEnum,
  IsDate,
  IsDateString,
  Length,
} from 'class-validator';
import { PartnerType, TransactionStatus, TransactionType } from '../entities';

export class CreateBankReceiptDto {
  @IsNotEmpty()
  @IsUUID()
  bankAccountId: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  subType: string; // e.g., 'Báo có', 'Thu theo HĐ'

  @IsNotEmpty()
  @IsDateString()
  docDate: string; // Format: YYYY-MM-DD

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string; // Default: VND

  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number; // Default: 1

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsEnum(PartnerType)
  partnerType?: PartnerType;

  @IsOptional()
  @IsUUID()
  partnerId?: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  debitAccount: string; // Tài khoản Ngân hàng (Account receiving cash)

  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  creditAccount: string; // Tài khoản doanh thu/khác
}

export class CreateBankPaymentDto {
  @IsNotEmpty()
  @IsUUID()
  bankAccountId: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  subType: string; // e.g., 'Báo nợ', 'Chi đề nghị'

  @IsNotEmpty()
  @IsDateString()
  docDate: string; // Format: YYYY-MM-DD

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string; // Default: VND

  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number; // Default: 1

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsEnum(PartnerType)
  partnerType?: PartnerType;

  @IsOptional()
  @IsUUID()
  partnerId?: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  debitAccount: string; // Tài khoản chi phí/khác

  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  creditAccount: string; // Tài khoản Ngân hàng (Account paying cash)
}

export class UpdateBankTransactionDto {
  @IsOptional()
  @IsString()
  @Length(2, 50)
  subType?: string;

  @IsOptional()
  @IsDateString()
  docDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number;

  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string;

  @IsOptional()
  @IsEnum(PartnerType)
  partnerType?: PartnerType;

  @IsOptional()
  @IsUUID()
  partnerId?: string;
}

export class QueryTransactionDto {
  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @IsOptional()
  @IsUUID()
  bankAccountId?: string;

  @IsOptional()
  @IsOptional()
  @IsNumber()
  page?: number; // Default: 1

  @IsOptional()
  @IsNumber()
  limit?: number; // Default: 20
}

export class BankTransactionResponseDto {
  id: string;
  branchId: string;
  type: TransactionType;
  subType: string;
  docNo: string;
  docDate: string;
  bankAccountId: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  amountVnd: number;
  description: string | null;
  partnerType: PartnerType | null;
  partnerId: string | null;
  debitAccount: string;
  creditAccount: string;
  status: TransactionStatus;
  postedAt: Date | null;
  postedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
