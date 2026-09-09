import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ob_employee_debt')
export class ObEmployeeDebt {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', name: 'nam_ke_toan' })
  namKeToan: number;

  @Column({ type: 'bigint', name: 'nhan_vien_id', nullable: true })
  nhanVienId: number;

  @Column({ type: 'varchar', length: 255, name: 'ten_nhan_vien' })
  tenNhanVien: string;

  @Column({ type: 'varchar', length: 30, name: 'ma_nhan_vien', nullable: true })
  maNhanVien: string;

  @Column({ type: 'enum', enum: ['TAM_UNG', 'LUONG', 'KHOAN_VAY', 'KHAC'], name: 'loai_cong_no', nullable: true })
  loaiCongNo: string;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'so_tien_nv_no', default: 0 })
  soTienNvNo: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'so_tien_cty_no', default: 0 })
  soTienCtyNo: number;

  @Column({ type: 'text', name: 'dien_giai', nullable: true })
  dienGiai: string;

  @Column({ type: 'text', name: 'ghi_chu', nullable: true })
  ghiChu: string;
}
