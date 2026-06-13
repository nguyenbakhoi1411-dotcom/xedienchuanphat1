import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { BankAccount } from './bank-account.entity';

export enum TransactionType {
  RECEIPT = 'RECEIPT',
  PAYMENT = 'PAYMENT',
}

export enum TransactionStatus {
  DRAFT = 'DRAFT',
  POSTED = 'POSTED',
  CANCELLED = 'CANCELLED',
}

export enum PartnerType {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
  EMPLOYEE = 'EMPLOYEE',
}

@Entity('bank_transactions')
@Index(['branchId', 'docDate'])
@Index(['status'])
@Index(['type', 'subType'])
@Index(['bankAccountId'])
@Index(['docNo'])
@Index(['branchId', 'docNo'], { unique: true })
export class BankTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  branchId: string;

  @Column('enum', { enum: TransactionType })
  type: TransactionType;

  @Column('varchar', { length: 50 })
  subType: string;

  @Column('varchar', { length: 30 })
  docNo: string;

  @Column('date')
  docDate: string;

  @Column('char', { length: 36 })
  bankAccountId: string;

  @ManyToOne(() => BankAccount)
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: BankAccount;

  @Column('decimal', { precision: 18, scale: 2 })
  amount: number;

  @Column('char', { length: 3, default: 'VND' })
  currency: string;

  @Column('decimal', { precision: 10, scale: 4, default: 1 })
  exchangeRate: number;

  @Column('decimal', { precision: 18, scale: 2 })
  amountVnd: number;

  @Column('text', { nullable: true })
  description: string;

  @Column('enum', { enum: PartnerType, nullable: true })
  partnerType: PartnerType | null;

  @Column('char', { length: 36, nullable: true })
  partnerId: string | null;

  @Column('varchar', { length: 20 })
  debitAccount: string;

  @Column('varchar', { length: 20 })
  creditAccount: string;

  @Column('enum', { enum: TransactionStatus, default: TransactionStatus.DRAFT })
  status: TransactionStatus;

  @Column('datetime', { nullable: true })
  postedAt: Date | null;

  @Column('char', { length: 36, nullable: true })
  postedBy: string | null;

  @Column('char', { length: 36, nullable: true })
  refDocId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('char', { length: 36, nullable: true })
  createdBy: string;

  @Column('char', { length: 36, nullable: true })
  updatedBy: string;
}
