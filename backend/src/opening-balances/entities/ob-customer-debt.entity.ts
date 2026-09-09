import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ob_customer_debt')
export class ObCustomerDebt {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', name: 'nam_ke_toan' })
  namKeToan: number;

  @Column({ type: 'bigint', name: 'khach_hang_id' })
  khachHangId: number;

  @Column({ type: 'varchar', length: 30, name: 'ma_khach_hang', nullable: true })
  maKhachHang: string;

  @Column({ type: 'varchar', length: 255, name: 'ten_khach_hang', nullable: true })
  tenKhachHang: string;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'so_tien_phai_thu', default: 0 })
  soTienPhaiThu: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'so_tien_khach_ung', default: 0 })
  soTienKhachUng: number;

  @Column({ type: 'date', name: 'han_thanh_toan', nullable: true })
  hanThanhToan: string;

  @Column({ type: 'text', name: 'dien_giai', nullable: true })
  dienGiai: string;

  @Column({ type: 'text', name: 'ghi_chu', nullable: true })
  ghiChu: string;
}
