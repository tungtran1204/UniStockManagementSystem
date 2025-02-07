import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:8080/api/unistock/au_01"; // Cập nhật URL thực tế

// Cấu hình axios với token tự động gửi trong request headers
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🟢 Đăng nhập: Gọi API, lưu token và user vào LocalStorage
export const login = async (credentials) => {
  try {
    const response = await apiClient.post("/login", credentials);
    const { token } = response.data;

    if (token) {
      localStorage.setItem("token", token);

      try {
        const decodedToken = jwtDecode(token); // Giải mã token để lấy thông tin user
        console.log("Decoded Token:", decodedToken); // Debug kiểm tra token có đủ dữ liệu không

        const user = {
          email: decodedToken.sub || decodedToken.email, // Email của user
          name: decodedToken.name || "Unknown User", // Tên của user (nếu có)
          role: decodedToken.role || "USER", // Role của user (nếu có)
        };

        localStorage.setItem("user", JSON.stringify(user)); // Lưu user vào LocalStorage
        return user;
      } catch (error) {
        console.error("Lỗi giải mã token:", error);
        throw new Error("Token không hợp lệ!");
      }
    }
    throw new Error("Đăng nhập thất bại!");
  } catch (error) {
    console.error("Lỗi đăng nhập:", error.response?.data || error.message);
    throw error.response?.data || "Đăng nhập thất bại!";
  }
};

// 🟢 Đăng xuất: Xóa token và user khỏi LocalStorage
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

// 🟢 Lấy thông tin user từ LocalStorage thay vì decode token mỗi lần
export const getUser = () => {
  const storedUser = localStorage.getItem("user");
  return storedUser ? JSON.parse(storedUser) : null;
};

// 🟢 Kiểm tra user có đăng nhập hay không, đồng thời kiểm tra token hết hạn chưa
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 > Date.now(); // Kiểm tra token có hết hạn không
  } catch (error) {
    return false;
  }
};

// 🟢 Tự động gửi token trong tất cả các request API
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
