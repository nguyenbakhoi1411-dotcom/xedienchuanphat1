import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ob_bank_accounts')
export class ObBankAccount {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', name: 'nam_ke_toan' })
  namKeToan: number;

  @Column({ type: 'bigint', name: 'bank_account_id' })
  bankAccountId: number;

  @Column({ type: 'varchar', length: 255, name: 'ten_ngan_hang', nullable: true })
  tenNganHang: string;

  @Column({ type: 'varchar', length: 50, name: 'so_tai_khoan', nullable: true })
  soTaiKhoan: string;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'so_du_dau_ky', default: 0 })
  soDuDauKy: number;

  @Column({ type: 'date', name: 'ngay_so_du', nullable: true })
  ngaySoDu: string;

  @Column({ type: 'text', name: 'ghi_chu', nullable: true })
  ghiChu: string;
}
