import axios from "axios";
import { jwtDecode } from "jwt-decode"; // 🔥 Đổi từ `import jwtDecode from "jwt-decode";`

const API_URL = "https://api.example.com/auth"; // Cập nhật URL API thực tế

// Đăng nhập, nhận token và lưu vào LocalStorage
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_URL}/login`, credentials);
    const { token } = response.data;

    if (token) {
      localStorage.setItem("token", token);
      return jwtDecode(token); // Giải mã token để lấy thông tin user
    }

    throw new Error("Đăng nhập thất bại!");
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    throw error;
  }
};

// Đăng xuất, xóa token khỏi LocalStorage
export const logout = () => {
  localStorage.removeItem("token");
};

// Lấy thông tin user từ token
export const getUser = () => {
  const token = localStorage.getItem("token");
  return token ? jwtDecode(token) : null;
};

// Kiểm tra user có đăng nhập hay không
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now(); // Kiểm tra token hết hạn chưa
  } catch (error) {
    return false;
  }
};
