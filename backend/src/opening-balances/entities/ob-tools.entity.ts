import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ob_tools_in_use')
export class ObToolsInUse {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', name: 'nam_ke_toan' })
  namKeToan: number;

  @Column({ type: 'varchar', length: 255, name: 'ten_ccdc' })
  tenCcdc: string;

  @Column({ type: 'varchar', length: 50, name: 'ma_ccdc', nullable: true })
  maCcdc: string;

  @Column({ type: 'varchar', length: 50, name: 'don_vi_tinh', nullable: true })
  donViTinh: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'so_luong', default: 1 })
  soLuong: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'nguyen_gia' })
  nguyenGia: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'gia_tri_con_lai' })
  giaTriConLai: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'phan_bo_moi_thang', default: 0 })
  phanBoMoiThang: number;

  @Column({ type: 'int', name: 'thang_con_lai', default: 0 })
  thangConLai: number;

  @Column({ type: 'varchar', length: 255, name: 'bo_phan_su_dung', nullable: true })
  boPhanSuDung: string;

  @Column({ type: 'varchar', length: 10, name: 'tai_khoan_cp', default: '642' })
  taiKhoanCp: string;

  @Column({ type: 'text', name: 'ghi_chu', nullable: true })
  ghiChu: string;
}
