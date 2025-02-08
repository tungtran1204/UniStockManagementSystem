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
    const response = await apiClient.post("/login", credentials);
    const { token } = response.data;

    if (!token) {
      throw new Error("Không nhận được token từ server!");
    }

    localStorage.setItem("token", token); // ✅ Lưu token vào LocalStorage

    try {
      const decodedToken = jwtDecode(token); // 🟢 Giải mã token
      console.log("🔹 Decoded Token:", decodedToken);

      if (!decodedToken.email || !decodedToken.role) {
        throw new Error("Token không chứa email hoặc role hợp lệ.");
      }

      const user = {
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email, // Nếu không có `name`, dùng `email`
        role: decodedToken.role,
        token: token,
      };

      localStorage.setItem("user", JSON.stringify(user)); // ✅ Lưu user vào LocalStorage
      return user;
    } catch (error) {
      console.error("🚨 Lỗi giải mã token:", error);
      logout();
      throw new Error("Token không hợp lệ!");
    }
  } catch (error) {
    console.error("🚨 Lỗi đăng nhập:", error.response?.data || error.message);
    throw error.response?.data || "Đăng nhập thất bại!";
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
