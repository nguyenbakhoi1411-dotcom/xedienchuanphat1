import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Generated,
} from 'typeorm';
import { BankAccount } from './bank-account.entity';

export enum ReconciliationStatus {
  OPEN = 'OPEN',
  MATCHED = 'MATCHED',
  CLOSED = 'CLOSED',
}

@Entity('bank_reconciliations')
@Index(['bankAccountId', 'period'], { unique: true })
@Index(['status'])
export class BankReconciliation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('char', { length: 36 })
  bankAccountId: string;

  @ManyToOne(() => BankAccount)
  @JoinColumn({ name: 'bankAccountId' })
  bankAccount: BankAccount;

  @Column('char', { length: 7 }) // Format: YYYY-MM
  period: string;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  statementBalance: number;

  @Column('decimal', { precision: 18, scale: 2, default: 0 })
  bookBalance: number;

  @Column('enum', { enum: ReconciliationStatus, default: ReconciliationStatus.OPEN })
  status: ReconciliationStatus;

  @Column('datetime', { nullable: true })
  reconciledAt: Date | null;

  @Column('char', { length: 36, nullable: true })
  reconciledBy: string | null;

  @Column('text', { nullable: true })
  notes: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
