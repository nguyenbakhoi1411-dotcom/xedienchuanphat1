import { IsNotEmpty, IsString, IsUUID, IsNumber, Min, IsOptional, IsBoolean, Length } from 'class-validator';

export class CreateBankAccountDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 30)
  accountNo: string;

  @IsNotEmpty()
  @IsString()
  @Length(5, 200)
  accountName: string;

  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  bankName: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  bankBranch?: string;

  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string; // Default: VND

  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  accountingCode: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  openingBalance?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  @Length(5, 200)
  accountName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  bankName?: string;

  @IsOptional()
  @IsString()
  @Length(0, 200)
  bankBranch?: string;

  @IsOptional()
  @IsString()
  @Length(2, 20)
  accountingCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BankAccountResponseDto {
  id: string;
  branchId: string;
  accountNo: string;
  accountName: string;
  bankName: string;
  bankBranch: string | null;
  currency: string;
  accountingCode: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
