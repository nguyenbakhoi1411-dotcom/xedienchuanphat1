import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('ob_accounts')
export class ObAccount {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', name: 'nam_ke_toan' })
  namKeToan: number;

  @Column({ type: 'varchar', length: 10, name: 'ma_tai_khoan' })
  maTaiKhoan: string;

  @Column({ type: 'varchar', length: 255, name: 'ten_tai_khoan', nullable: true })
  tenTaiKhoan: string;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'du_no', default: 0 })
  duNo: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'du_co', default: 0 })
  duCo: number;

  @Column({ type: 'text', name: 'ghi_chu', nullable: true })
  ghiChu: string;

  @UpdateDateColumn({ name: 'ngay_cap_nhat' })
  ngayCapNhat: Date;
}
