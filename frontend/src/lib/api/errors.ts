import axios from "axios";

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }

    if (error.response?.status === 401) {
      return "Email, so dien thoai hoac mat khau khong dung.";
    }

    if (error.response?.status === 403) {
      return "Tai khoan khong co quyen thuc hien thao tac nay.";
    }

    if (error.code === "ECONNABORTED") {
      return "Ket noi qua thoi gian cho. Vui long thu lai.";
    }

    if (!error.response) {
      return "Khong the ket noi may chu. Vui long kiem tra API.";
    }
  }

  return "Da co loi xay ra. Vui long thu lai.";
}
