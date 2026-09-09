import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ob_supplier_debt')
export class ObSupplierDebt {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', name: 'nam_ke_toan' })
  namKeToan: number;

  @Column({ type: 'bigint', name: 'nha_cung_cap_id' })
  nhaCungCapId: number;

  @Column({ type: 'varchar', length: 30, name: 'ma_ncc', nullable: true })
  maNcc: string;

  @Column({ type: 'varchar', length: 255, name: 'ten_ncc', nullable: true })
  tenNcc: string;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'so_tien_phai_tra', default: 0 })
  soTienPhaiTra: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'so_tien_ncc_ung', default: 0 })
  soTienNccUng: number;

  @Column({ type: 'date', name: 'han_thanh_toan', nullable: true })
  hanThanhToan: string;

  @Column({ type: 'text', name: 'dien_giai', nullable: true })
  dienGiai: string;

  @Column({ type: 'text', name: 'ghi_chu', nullable: true })
  ghiChu: string;
}
