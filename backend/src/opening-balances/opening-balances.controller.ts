import { Controller, Get, Post, Put, Delete, Body, Param, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { OpeningBalancesService } from './opening-balances.service';

@Controller('api/opening-balances')
export class OpeningBalancesController {
  constructor(private readonly service: OpeningBalancesService) {}

  // ================= C0. TỔNG QUAN & CẤU HÌNH =================
  @Get('config')
  async getConfig() {
    return this.service.getConfig();
  }

  @Put('config')
  async updateConfig(@Body() body: any) {
    return this.service.updateConfig(body);
  }

  @Post('lock')
  async lockOpeningBalance() {
    return this.service.lockOpeningBalance();
  }

  @Get('summary')
  async getSummary() {
    return this.service.getSummary();
  }

  // ================= C1. SỐ DƯ TÀI KHOẢN =================
  @Get('accounts')
  async getAccounts(@Query('namKeToan') namKeToan: number) {
    return this.service.getAccounts(namKeToan);
  }

  @Post('accounts/batch')
  async saveAccountsBatch(@Body() body: any) {
    return this.service.saveAccountsBatch(body);
  }

  @Delete('accounts/:maTaiKhoan')
  async deleteAccount(@Param('maTaiKhoan') maTaiKhoan: string, @Query('namKeToan') namKeToan: number) {
    return this.service.deleteAccount(maTaiKhoan, namKeToan);
  }

  // ================= C2. SỐ DƯ TK NGÂN HÀNG =================
  @Get('bank-accounts')
  async getBankAccounts(@Query('namKeToan') namKeToan: number) {
    return this.service.getBankAccounts(namKeToan);
  }

  @Post('bank-accounts/batch')
  async saveBankAccountsBatch(@Body() body: any) {
    return this.service.saveBankAccountsBatch(body);
  }

  @Delete('bank-accounts/:id')
  async deleteBankAccount(@Param('id') id: number) {
    return this.service.deleteBankAccount(id);
  }

  // ================= C3. CÔNG NỢ KHÁCH HÀNG =================
  @Get('customer-debt')
  async getCustomerDebt(@Query() query: any) {
    return this.service.getCustomerDebt(query);
  }

  @Post('customer-debt/batch')
  async saveCustomerDebtBatch(@Body() body: any) {
    return this.service.saveCustomerDebtBatch(body);
  }

  @Put('customer-debt/:id')
  async updateCustomerDebt(@Param('id') id: number, @Body() body: any) {
    return this.service.updateCustomerDebt(id, body);
  }

  @Delete('customer-debt/:id')
  async deleteCustomerDebt(@Param('id') id: number) {
    return this.service.deleteCustomerDebt(id);
  }

  // ================= C4. CÔNG NỢ NHÀ CUNG CẤP =================
  @Get('supplier-debt')
  async getSupplierDebt(@Query() query: any) {
    return this.service.getSupplierDebt(query);
  }

  @Post('supplier-debt/batch')
  async saveSupplierDebtBatch(@Body() body: any) {
    return this.service.saveSupplierDebtBatch(body);
  }

  @Put('supplier-debt/:id')
  async updateSupplierDebt(@Param('id') id: number, @Body() body: any) {
    return this.service.updateSupplierDebt(id, body);
  }

  @Delete('supplier-debt/:id')
  async deleteSupplierDebt(@Param('id') id: number) {
    return this.service.deleteSupplierDebt(id);
  }

  // ================= C5. CÔNG NỢ NHÂN VIÊN =================
  @Get('employee-debt')
  async getEmployeeDebt(@Query('namKeToan') namKeToan: number) {
    return this.service.getEmployeeDebt(namKeToan);
  }

  @Post('employee-debt/batch')
  async saveEmployeeDebtBatch(@Body() body: any) {
    return this.service.saveEmployeeDebtBatch(body);
  }

  @Put('employee-debt/:id')
  async updateEmployeeDebt(@Param('id') id: number, @Body() body: any) {
    return this.service.updateEmployeeDebt(id, body);
  }

  @Delete('employee-debt/:id')
  async deleteEmployeeDebt(@Param('id') id: number) {
    return this.service.deleteEmployeeDebt(id);
  }

  // ================= C6. TỒN KHO =================
  @Get('inventory')
  async getInventory(@Query() query: any) {
    return this.service.getInventory(query);
  }

  @Post('inventory/batch')
  async saveInventoryBatch(@Body() body: any) {
    return this.service.saveInventoryBatch(body);
  }

  @Put('inventory/:id')
  async updateInventory(@Param('id') id: number, @Body() body: any) {
    return this.service.updateInventory(id, body);
  }

  @Delete('inventory/:id')
  async deleteInventory(@Param('id') id: number) {
    return this.service.deleteInventory(id);
  }

  @Post('inventory/import-excel')
  async importInventoryExcel(@UploadedFile() file: any, @Body() body: any) {
    // Requires FileInterceptor in reality
    return this.service.importInventoryExcel(file, body);
  }

  @Get('inventory/template')
  async getInventoryExcelTemplate() {
    return this.service.getInventoryExcelTemplate();
  }

  // ================= C7. CCDC ĐANG SỬ DỤNG =================
  @Get('tools')
  async getTools(@Query('namKeToan') namKeToan: number) {
    return this.service.getTools(namKeToan);
  }

  @Post('tools/batch')
  async saveToolsBatch(@Body() body: any) {
    return this.service.saveToolsBatch(body);
  }

  @Put('tools/:id')
  async updateTool(@Param('id') id: number, @Body() body: any) {
    return this.service.updateTool(id, body);
  }

  @Delete('tools/:id')
  async deleteTool(@Param('id') id: number) {
    return this.service.deleteTool(id);
  }

  // ================= C8. TÀI SẢN CỐ ĐỊNH =================
  @Get('fixed-assets')
  async getFixedAssets(@Query('namKeToan') namKeToan: number) {
    return this.service.getFixedAssets(namKeToan);
  }

  @Post('fixed-assets/batch')
  async saveFixedAssetsBatch(@Body() body: any) {
    return this.service.saveFixedAssetsBatch(body);
  }

  @Put('fixed-assets/:id')
  async updateFixedAsset(@Param('id') id: number, @Body() body: any) {
    return this.service.updateFixedAsset(id, body);
  }

  @Delete('fixed-assets/:id')
  async deleteFixedAsset(@Param('id') id: number) {
    return this.service.deleteFixedAsset(id);
  }

  // ================= C9. CHI PHÍ TRẢ TRƯỚC =================
  @Get('prepaid-expenses')
  async getPrepaidExpenses(@Query('namKeToan') namKeToan: number) {
    return this.service.getPrepaidExpenses(namKeToan);
  }

  @Post('prepaid-expenses/batch')
  async savePrepaidExpensesBatch(@Body() body: any) {
    return this.service.savePrepaidExpensesBatch(body);
  }

  @Put('prepaid-expenses/:id')
  async updatePrepaidExpense(@Param('id') id: number, @Body() body: any) {
    return this.service.updatePrepaidExpense(id, body);
  }

  @Delete('prepaid-expenses/:id')
  async deletePrepaidExpense(@Param('id') id: number) {
    return this.service.deletePrepaidExpense(id);
  }

  // ================= C10. CHI PHÍ DỞ DANG =================
  @Get('wip')
  async getWip(@Query('namKeToan') namKeToan: number) {
    return this.service.getWip(namKeToan);
  }

  @Post('wip/batch')
  async saveWipBatch(@Body() body: any) {
    return this.service.saveWipBatch(body);
  }

  @Put('wip/:id')
  async updateWip(@Param('id') id: number, @Body() body: any) {
    return this.service.updateWip(id, body);
  }

  @Delete('wip/:id')
  async deleteWip(@Param('id') id: number) {
    return this.service.deleteWip(id);
  }
}
