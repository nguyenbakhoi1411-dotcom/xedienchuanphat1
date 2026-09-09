import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OpeningBalanceConfig } from './entities/opening-balance-config.entity';
import { ObAccount } from './entities/ob-account.entity';
import { ObBankAccount } from './entities/ob-bank-account.entity';
import { ObCustomerDebt } from './entities/ob-customer-debt.entity';
import { ObSupplierDebt } from './entities/ob-supplier-debt.entity';
import { ObEmployeeDebt } from './entities/ob-employee-debt.entity';
import { ObInventory } from './entities/ob-inventory.entity';
import { ObToolsInUse } from './entities/ob-tools.entity';
import { ObFixedAsset } from './entities/ob-fixed-asset.entity';
import { ObPrepaidExpense } from './entities/ob-prepaid-expense.entity';
import { ObWip } from './entities/ob-wip.entity';

@Injectable()
export class OpeningBalancesService {
  constructor(
    @InjectRepository(OpeningBalanceConfig) private configRepo: Repository<OpeningBalanceConfig>,
    @InjectRepository(ObAccount) private accountRepo: Repository<ObAccount>,
    @InjectRepository(ObBankAccount) private bankRepo: Repository<ObBankAccount>,
    @InjectRepository(ObCustomerDebt) private custRepo: Repository<ObCustomerDebt>,
    @InjectRepository(ObSupplierDebt) private suppRepo: Repository<ObSupplierDebt>,
    @InjectRepository(ObEmployeeDebt) private empRepo: Repository<ObEmployeeDebt>,
    @InjectRepository(ObInventory) private invRepo: Repository<ObInventory>,
    @InjectRepository(ObToolsInUse) private toolRepo: Repository<ObToolsInUse>,
    @InjectRepository(ObFixedAsset) private fixedRepo: Repository<ObFixedAsset>,
    @InjectRepository(ObPrepaidExpense) private prepRepo: Repository<ObPrepaidExpense>,
    @InjectRepository(ObWip) private wipRepo: Repository<ObWip>,
  ) {}
  
  // ================= C0. TỔNG QUAN & CẤU HÌNH =================
  async getConfig(namKeToan: number = 2026) {
    let config = await this.configRepo.findOne({ where: { namKeToan } });
    if (!config) {
      config = this.configRepo.create({
        namKeToan,
        ngayBatDauSuDung: "2026-01-01",
        trangThai: "DRAFT",
      });
      await this.configRepo.save(config);
    }
    
    return {
      ...config,
      tienDoNhap: {
        soduTaiKhoan: true,
        soDuNganHang: true,
        congNoKhachHang: false,
        congNoNCC: false,
        congNoNhanVien: false,
        tonKho: false,
        ccdc: false,
        tscd: false,
        chiPhiTraTruoc: false,
        chiPhiDoDang: false,
        phanTramHoanThanh: 20
      },
      canDoi: {
        tongDuNo: 150000000,
        tongDuCo: 145000000,
        chenhLech: 5000000,
        daCanDoi: false
      }
    };
  }

  async updateConfig(body: any) {
    return { success: true, message: 'Config updated', data: body };
  }

  async lockOpeningBalance() {
    return { success: true, message: 'Opening balance locked' };
  }

  async getSummary() {
    return {
      tongDuNo: 150000000,
      tongDuCo: 150000000,
      canDoi: true
    };
  }

  // ================= C1. SỐ DƯ TÀI KHOẢN =================
  async getAccounts(namKeToan: number) { 
    const dbAccounts = await this.accountRepo.find({ where: { namKeToan } });
    
    const baseTree = [
      { code: "111", name: "Tiền mặt", level: 1, nature: "DU_NO", hasChildren: true, parentCode: null, isDetail: false },
      { code: "1111", name: "Tiền Việt Nam", level: 2, nature: "DU_NO", hasChildren: false, parentCode: "111", isDetail: false },
      { code: "112", name: "Tiền gửi Ngân hàng", level: 1, nature: "DU_NO", hasChildren: true, parentCode: null, isDetail: false },
      { code: "1121", name: "Tiền Việt Nam", level: 2, nature: "DU_NO", hasChildren: false, parentCode: "112", isDetail: true, detailLink: "/opening-balances/bank", detailText: "Nhập số dư tài khoản ngân hàng" },
      { code: "131", name: "Phải thu của khách hàng", level: 1, nature: "LUONG_TINH", hasChildren: false, parentCode: null, isDetail: true, detailLink: "/opening-balances/customer-debt", detailText: "Nhập số dư công nợ khách hàng" },
      { code: "331", name: "Phải trả cho người bán", level: 1, nature: "LUONG_TINH", hasChildren: false, parentCode: null, isDetail: true, detailLink: "/opening-balances/supplier-debt", detailText: "Nhập công nợ nhà cung cấp" },
      { code: "421", name: "Lợi nhuận sau thuế chưa phân phối", level: 1, nature: "LUONG_TINH", hasChildren: true, parentCode: null, isDetail: false },
      { code: "4212", name: "Lợi nhuận sau thuế chưa phân phối năm nay", level: 2, nature: "LUONG_TINH", hasChildren: false, parentCode: "421", isDetail: false },
    ];

    return baseTree.map(item => {
      const dbInfo = dbAccounts.find(x => x.maTaiKhoan === item.code);
      return {
        ...item,
        debit: dbInfo ? Number(dbInfo.duNo) : 0,
        credit: dbInfo ? Number(dbInfo.duCo) : 0
      };
    });
  }
  
  async saveAccountsBatch(body: any) {
    const { namKeToan, items } = body;
    for (const item of items) {
      let acc = await this.accountRepo.findOne({ where: { namKeToan, maTaiKhoan: item.code } });
      if (!acc) {
        acc = this.accountRepo.create({ namKeToan, maTaiKhoan: item.code });
      }
      acc.duNo = item.debit;
      acc.duCo = item.credit;
      await this.accountRepo.save(acc);
    }
    return { success: true };
  }
  
  async deleteAccount(maTaiKhoan: string, namKeToan: number) { return { success: true }; }

  // ================= C2. SỐ DƯ TK NGÂN HÀNG =================
  async getBankAccounts(namKeToan: number) { 
    return this.bankRepo.find({ where: { namKeToan } });
  }
  async saveBankAccountsBatch(body: any) { 
    const { namKeToan, items } = body;
    for (const item of items) {
       let bankAcc = await this.bankRepo.findOne({ where: { namKeToan, soTaiKhoan: item.soTaiKhoan }});
       if (!bankAcc) {
          bankAcc = this.bankRepo.create({ namKeToan, soTaiKhoan: item.soTaiKhoan, bankAccountId: item.bankAccountId || Date.now() });
       }
       bankAcc.tenNganHang = item.tenNganHang;
       bankAcc.soDuDauKy = item.soDuDauKy;
       await this.bankRepo.save(bankAcc);
    }
    return { success: true, count: items.length }; 
  }
  async deleteBankAccount(id: number) { return { success: true }; }

  // ================= C3. CÔNG NỢ KHÁCH HÀNG =================
  async getCustomerDebt(query: any) { 
    const items = await this.custRepo.find({ where: { namKeToan: query.namKeToan }});
    return { items, total: items.length }; 
  }
  async saveCustomerDebtBatch(body: any) { 
    const { namKeToan, items } = body;
    for (const item of items) {
       let cust = await this.custRepo.findOne({ where: { namKeToan, maKhachHang: item.maKhachHang }});
       if (!cust) {
          cust = this.custRepo.create({ namKeToan, maKhachHang: item.maKhachHang, khachHangId: item.khachHangId || Date.now() });
       }
       cust.tenKhachHang = item.tenKhachHang;
       cust.soTienPhaiThu = item.soTienPhaiThu;
       cust.soTienKhachUng = item.soTienKhachUng;
       await this.custRepo.save(cust);
    }
    return { success: true, count: items.length }; 
  }
  async updateCustomerDebt(id: number, body: any) { return { success: true }; }
  async deleteCustomerDebt(id: number) { return { success: true }; }

  // ================= C4. CÔNG NỢ NHÀ CUNG CẤP =================
  async getSupplierDebt(query: any) { 
    const items = await this.suppRepo.find({ where: { namKeToan: query.namKeToan }});
    return { items, total: items.length }; 
  }
  async saveSupplierDebtBatch(body: any) { return { success: true }; }
  async updateSupplierDebt(id: number, body: any) { return { success: true }; }
  async deleteSupplierDebt(id: number) { return { success: true }; }

  // ================= C5. CÔNG NỢ NHÂN VIÊN =================
  async getEmployeeDebt(namKeToan: number) { return this.empRepo.find({ where: { namKeToan } }); }
  async saveEmployeeDebtBatch(body: any) { return { success: true }; }
  async updateEmployeeDebt(id: number, body: any) { return { success: true }; }
  async deleteEmployeeDebt(id: number) { return { success: true }; }

  // ================= C6. TỒN KHO =================
  async getInventory(query: any) { 
    const items = await this.invRepo.find({ where: { namKeToan: query.namKeToan }});
    return { items, total: items.length }; 
  }
  async saveInventoryBatch(body: any) { return { success: true }; }
  async updateInventory(id: number, body: any) { return { success: true }; }
  async deleteInventory(id: number) { return { success: true }; }
  async importInventoryExcel(file: any, body: any) { return { imported: 50, errors: [] }; }
  async getInventoryExcelTemplate() { return { url: '/templates/inventory.xlsx' }; }

  // ================= C7. CCDC ĐANG SỬ DỤNG =================
  async getTools(namKeToan: number) { return this.toolRepo.find({ where: { namKeToan } }); }
  async saveToolsBatch(body: any) { return { success: true }; }
  async updateTool(id: number, body: any) { return { success: true }; }
  async deleteTool(id: number) { return { success: true }; }

  // ================= C8. TÀI SẢN CỐ ĐỊNH =================
  async getFixedAssets(namKeToan: number) { return this.fixedRepo.find({ where: { namKeToan } }); }
  async saveFixedAssetsBatch(body: any) { return { success: true }; }
  async updateFixedAsset(id: number, body: any) { return { success: true }; }
  async deleteFixedAsset(id: number) { return { success: true }; }

  // ================= C9. CHI PHÍ TRẢ TRƯỚC =================
  async getPrepaidExpenses(namKeToan: number) { return this.prepRepo.find({ where: { namKeToan } }); }
  async savePrepaidExpensesBatch(body: any) { return { success: true }; }
  async updatePrepaidExpense(id: number, body: any) { return { success: true }; }
  async deletePrepaidExpense(id: number) { return { success: true }; }

  // ================= C10. CHI PHÍ DỞ DANG =================
  async getWip(namKeToan: number) { return this.wipRepo.find({ where: { namKeToan } }); }
  async saveWipBatch(body: any) { return { success: true }; }
  async updateWip(id: number, body: any) { return { success: true }; }
  async deleteWip(id: number) { return { success: true }; }
}
