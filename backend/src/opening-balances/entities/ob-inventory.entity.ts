import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ob_inventory')
export class ObInventory {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', name: 'nam_ke_toan' })
  namKeToan: number;

  @Column({ type: 'bigint', name: 'san_pham_id' })
  sanPhamId: number;

  @Column({ type: 'varchar', length: 30, name: 'ma_san_pham', nullable: true })
  maSanPham: string;

  @Column({ type: 'varchar', length: 255, name: 'ten_san_pham', nullable: true })
  tenSanPham: string;

  @Column({ type: 'varchar', length: 50, name: 'don_vi_tinh', nullable: true })
  donViTinh: string;

  @Column({ type: 'enum', enum: ['HANG_HOA', 'VAT_TU', 'CCDC'], name: 'loai', default: 'HANG_HOA' })
  loai: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, name: 'so_luong_dau_ky' })
  soLuongDauKy: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'don_gia_nhap' })
  donGiaNhap: number;

  // gia_tri_ton_kho is a generated column in DB, we can map it but generally shouldn't insert into it
  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'gia_tri_ton_kho', insert: false, update: false })
  giaTriTonKho: number;

  @Column({ type: 'varchar', length: 100, name: 'kho', default: 'Kho chính' })
  kho: string;

  @Column({ type: 'text', name: 'ghi_chu', nullable: true })
  ghiChu: string;
}
