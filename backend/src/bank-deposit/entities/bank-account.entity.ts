import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { BankTransaction } from './bank-transaction.entity';

@Entity('bank_accounts')
@Index(['branchId', 'isActive'])
@Index(['accountNo', 'branchId'], { unique: true })
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  branchId: string;

  @Column('varchar', { length: 30 })
  accountNo: string;

  @Column('varchar', { length: 200 })
  accountName: string;

  @Column('varchar', { length: 100 })
  bankName: string;

  @Column('varchar', { length: 200, nullable: true })
  bankBranch: string;

  @Column('char', { length: 3, default: 'VND' })
  currency: string;

  @Column('varchar', { length: 20 })
  accountingCode: string;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  openingBalance: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  currentBalance: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('char', { length: 36, nullable: true })
  createdBy: string;

  @Column('char', { length: 36, nullable: true })
  updatedBy: string;

  @OneToMany(() => BankTransaction, (tx) => tx.bankAccount)
  transactions: BankTransaction[];
}
