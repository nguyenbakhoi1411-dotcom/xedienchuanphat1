import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('ob_wip')
export class ObWip {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @Column({ type: 'int', name: 'nam_ke_toan' })
  namKeToan: number;

  @Column({ type: 'varchar', length: 255, name: 'ten_cong_trinh' })
  tenCongTrinh: string;

  @Column({ type: 'varchar', length: 50, name: 'ma_cong_trinh', nullable: true })
  maCongTrinh: string;

  @Column({ type: 'enum', enum: ['CONG_TRINH', 'DON_HANG', 'SAN_PHAM', 'KHAC'], name: 'loai', nullable: true })
  loai: string;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'chi_phi_nvl', default: 0 })
  chiPhiNvl: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'chi_phi_nc', default: 0 })
  chiPhiNc: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'chi_phi_chung', default: 0 })
  chiPhiChung: number;

  @Column({ type: 'decimal', precision: 18, scale: 0, name: 'tong_chi_phi_dd', default: 0 })
  tongChiPhiDd: number;

  @Column({ type: 'text', name: 'ghi_chu', nullable: true })
  ghiChu: string;
}
