import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ob_prepaid_expenses')
export class ObPrepaidExpense {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', name: 'nam_ke_toan' })
  namKeToan: number;

  @Column({ type: 'varchar', length: 255, name: 'ten_chi_phi' })
  tenChiPhi: string;

  @Column({ type: 'varchar', length: 50, name: 'ma_chi_phi', nullable: true })
  maChiPhi: string;

  @Column({ type: 'date', name: 'ngay_bat_dau_pb' })
  ngayBatDauPb: string;

  @Column({ type: 'date', name: 'ngay_ket_thuc_pb' })
  ngayKetThucPb: string;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'so_tien_goc' })
  soTienGoc: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'so_tien_da_pb', default: 0 })
  soTienDaPb: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'so_tien_con_lai', insert: false, update: false })
  soTienConLai: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'pb_moi_thang', nullable: true })
  pbMoiThang: number;

  @Column({ type: 'int', name: 'so_thang_con_lai', nullable: true })
  soThangConLai: number;

  @Column({ type: 'varchar', length: 10, name: 'tai_khoan_cp', default: '642' })
  taiKhoanCp: string;

  @Column({ type: 'text', name: 'ghi_chu', nullable: true })
  ghiChu: string;
}
