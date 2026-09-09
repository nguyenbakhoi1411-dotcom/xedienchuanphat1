import axios from "axios";

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof Error && !(error as any).isAxiosError) {
    // Lỗi tự tạo (ví dụ: không kết nối server)
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    // Không có response = không kết nối được BE
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        return "Kết nối quá thời gian chờ. Vui lòng thử lại.";
      }
      return "Không thể kết nối máy chủ. Vui lòng kiểm tra Backend đã khởi động chưa.";
    }

    // Lấy message từ response body nếu có
    const serverMsg = error.response?.data?.message;
    if (typeof serverMsg === "string" && serverMsg.trim().length > 0) {
      return serverMsg;
    }

    // HTTP status fallback
    switch (error.response.status) {
      case 400: return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
      case 401: return "Tên đăng nhập hoặc mật khẩu không đúng.";
      case 403: return "Tài khoản không có quyền thực hiện thao tác này.";
      case 404: return "Không tìm thấy dữ liệu yêu cầu.";
      case 409: return "Dữ liệu đã tồn tại. Vui lòng kiểm tra lại.";
      case 422: return "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
      case 500: return "Lỗi máy chủ nội bộ. Vui lòng thử lại sau.";
      case 503: return "Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.";
      default:  return `Lỗi máy chủ (${error.response.status}). Vui lòng thử lại.`;
    }
  }

  return "Đã có lỗi xảy ra. Vui lòng thử lại.";
}
