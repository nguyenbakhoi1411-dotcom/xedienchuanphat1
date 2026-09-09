import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ob_fixed_assets')
export class ObFixedAsset {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', name: 'nam_ke_toan' })
  namKeToan: number;

  @Column({ type: 'varchar', length: 255, name: 'ten_tai_san' })
  tenTaiSan: string;

  @Column({ type: 'varchar', length: 50, name: 'ma_tai_san', nullable: true })
  maTaiSan: string;

  @Column({ type: 'varchar', length: 100, name: 'loai_tscd', nullable: true })
  loaiTscd: string;

  @Column({ type: 'date', name: 'ngay_mua', nullable: true })
  ngayMua: string;

  @Column({ type: 'date', name: 'ngay_dua_vao_su_dung' })
  ngayDuaVaoSuDung: string;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'nguyen_gia' })
  nguyenGia: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'gia_tri_hao_mon_lk', default: 0 })
  giaTriHaoMonLk: number;

  // Generated column in DB
  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'gia_tri_con_lai', insert: false, update: false })
  giaTriConLai: number;

  @Column({ type: 'enum', enum: ['STRAIGHT_LINE', 'DECLINING'], name: 'phuong_phap_kh', default: 'STRAIGHT_LINE' })
  phuongPhapKh: string;

  @Column({ type: 'int', name: 'thoi_gian_su_dung' })
  thoiGianSuDung: number;

  @Column({ type: 'int', name: 'so_thang_da_kh', default: 0 })
  soThangDaKh: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'kh_moi_thang', default: 0 })
  khMoiThang: number;

  @Column({ type: 'varchar', length: 255, name: 'bo_phan_su_dung', nullable: true })
  boPhanSuDung: string;

  @Column({ type: 'varchar', length: 10, name: 'tai_khoan_kh', default: '642' })
  taiKhoanKh: string;

  @Column({ type: 'text', name: 'ghi_chu', nullable: true })
  ghiChu: string;
}
