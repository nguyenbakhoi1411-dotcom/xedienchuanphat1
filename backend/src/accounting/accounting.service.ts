import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountingService {
  getAdvanceSettlements() {
    return [
      { id: 1, date: '2026-06-01', amount: 5000000, description: 'Quyết toán công tác phí HN', status: 'COMPLETED' },
      { id: 2, date: '2026-06-15', amount: 2500000, description: 'Mua sắm VPP', status: 'PENDING' },
    ];
  }

  getOtherVouchers() {
    return [
      { id: 1, date: '2026-06-10', type: 'KHAC', description: 'Phân bổ chi phí trả trước tháng 6', amount: 12000000 },
      { id: 2, date: '2026-06-20', type: 'KHAC', description: 'Trích khấu hao TSCĐ tháng 6', amount: 45000000 },
    ];
  }

  transferProfitLoss(period: string) {
    return {
      success: true,
      message: `Đã kết chuyển lãi lỗ thành công cho kỳ ${period}`,
      details: {
        revenue: 1500000000,
        expense: 1200000000,
        profit: 300000000
      }
    };
  }

  closePeriod(period: string) {
    return {
      success: true,
      message: `Đã khóa sổ kỳ kế toán ${period} thành công. Dữ liệu đã được chốt.`,
      closedDate: new Date().toISOString()
    };
  }

  getFinancialReports() {
    return [
      { code: 'B01a-DNN', name: 'Báo cáo tình hình tài chính', url: '/reports/b01a' },
      { code: 'B02-DNN', name: 'Báo cáo kết quả hoạt động kinh doanh', url: '/reports/b02' },
      { code: 'B03-DNN', name: 'Báo cáo lưu chuyển tiền tệ', url: '/reports/b03' },
      { code: 'B09-DNN', name: 'Thuyết minh BCTC', url: '/reports/b09' },
    ];
  }

  getQuickReports() {
    return [
      { id: 1, name: 'Sổ chi tiết các tài khoản', path: '/reports/so-chi-tiet' },
      { id: 2, name: 'Sổ nhật ký chung', path: '/reports/nhat-ky-chung' },
      { id: 3, name: 'Tổng hợp công nợ nhân viên', path: '/reports/cong-no-nv' },
      { id: 4, name: 'Tổng hợp công nợ theo đối tượng', path: '/reports/cong-no-doi-tuong' },
      { id: 5, name: 'B01a-DNN: Báo cáo tình hình tài chính', path: '/reports/b01a' },
    ];
  }
}
