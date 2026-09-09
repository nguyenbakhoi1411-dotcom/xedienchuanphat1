import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('opening_balance_config')
export class OpeningBalanceConfig {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'date', name: 'ngay_bat_dau_su_dung' })
  ngayBatDauSuDung: string;

  @Column({ type: 'int', name: 'nam_ke_toan', unique: true })
  namKeToan: number;

  @Column({ type: 'varchar', length: 10, name: 'ky_ke_toan', nullable: true })
  kyKeToan: string;

  @Column({ type: 'enum', enum: ['DRAFT', 'LOCKED'], default: 'DRAFT', name: 'trang_thai' })
  trangThai: string;

  @Column({ type: 'text', name: 'ghi_chu', nullable: true })
  ghiChu: string;

  @CreateDateColumn({ name: 'ngay_tao' })
  ngayTao: Date;

  @Column({ type: 'varchar', length: 255, name: 'created_by', nullable: true })
  createdBy: string;
}
