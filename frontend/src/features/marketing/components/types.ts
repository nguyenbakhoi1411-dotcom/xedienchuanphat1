export type PriceListType = 'BAN_LE' | 'BAN_BUON' | 'DAI_LY' | 'KHUYEN_MAI';
export type PriceListStatus = 'DANG_AP_DUNG' | 'CHUA_AP_DUNG' | 'HET_HAN' | 'NGUNG_AP_DUNG';

export interface PriceList {
  id: string;
  maBangGia: string;
  tenBangGia: string;
  loaiBangGia: PriceListType;
  apDungTu: string;
  apDungDen?: string;
  trangThai: PriceListStatus;
}

export type AdjustmentType = 'PERCENT_UP' | 'PERCENT_DOWN' | 'FIXED_UP' | 'FIXED_DOWN' | 'SET_PRICE' | 'SET_MARGIN';
export type RoundingType = 'NONE' | 'THOUSAND' | 'TEN_THOUSAND';

export interface PriceAdjustment {
  kieuDieuChinh: AdjustmentType;
  giaTri: number;
  lamTron: RoundingType;
  scope: 'GLOBAL' | 'CATEGORY' | 'PRODUCT';
  targetValue?: string;
}

export interface PricePreviewItem {
  id: string;
  maSanPham: string;
  tenSanPham: string;
  giaCu: number;
  giaMoi: number;
  chenhLech: number;
  tyLeLaiGopMoi: number;
}

export type PromotionType = 
  | 'PERCENT_DISCOUNT' 
  | 'FIXED_DISCOUNT' 
  | 'BUY_X_GET_Y' 
  | 'FREE_SHIPPING' 
  | 'BUNDLE_DISCOUNT' 
  | 'POINTS_MULTIPLIER' 
  | 'GIFT_WITH_PURCHASE';

export interface Promotion {
  id: string;
  name: string;
  type: PromotionType;
  value: number;
  minOrderValue?: number;
  minQuantity?: number;
  maxUses?: number;
  giftProductId?: string;
}
