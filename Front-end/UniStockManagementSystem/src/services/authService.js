import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:8080/api/unistock/auth"; // Cập nhật URL thực tế

// 🟢 **Cấu hình axios**
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// 🟢 **Hàm Đăng nhập**

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Lỗi đăng nhập: Sai email hoặc mật khẩu");
    }

    const userData = await response.json();
    console.log("📢 API Login Response:", JSON.stringify(userData, null, 2));

    if (!userData.token) {
      throw new Error("Token không hợp lệ từ server");
    }

    // ✅ Giải mã token
    const decodedToken = jwtDecode(userData.token);
    console.log("📢 Decoded Token:", decodedToken);

    // ✅ Kiểm tra nếu `roles` là chuỗi, chuyển thành mảng
    const roles = Array.isArray(decodedToken.roles)
      ? decodedToken.roles
      : decodedToken.roles.split(",").map((role) => role.trim());

    if (!decodedToken.email || roles.length === 0) {
      throw new Error("Token không chứa email hoặc role hợp lệ.");
    }

    return {
      email: decodedToken.email,
      token: userData.token,
      roles,
    };
  } catch (error) {
    console.error("🚨 Lỗi đăng nhập:", error.message);
    throw error;
  }
};

// 🟢 **Hàm Đăng xuất**
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// 🟢 **Lấy user từ LocalStorage**
export const getUser = () => {
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("🚨 Lỗi parse user từ LocalStorage:", error);
    return null;
  }
};

// 🟢 **Kiểm tra đăng nhập**
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch (error) {
    console.error("🚨 Lỗi kiểm tra Token:", error);
    return false;
  }
};

// 🟢 **Tự động gửi token trong tất cả các request API**
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
