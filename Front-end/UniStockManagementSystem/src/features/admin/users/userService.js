import axios from "axios";

const API_URL = "http://localhost:8080/api/unistock/admin/users"; // ✅ API cho User Management

// ✅ Hàm để lấy Token từ LocalStorage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {}; // ✅ Nếu không có token, trả về object rỗng
};

// 🟢 **Lấy danh sách Users**
export const getUsers = async () => {
  try {
    const response = await axios.get(API_URL, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách Users:", error);
    throw error;
  }
};

// 🔴 **Xóa user theo ID**
export const deleteUserById = async (userId) => {
  try {
    await axios.delete(`${API_URL}/${userId}`, { headers: authHeader() });
  } catch (error) {
    console.error("❌ Lỗi khi xóa User:", error);
    throw error;
  }
};

// 🔄 **Toggle trạng thái `isActive` của User**
export const toggleUserStatus = async (userId, newStatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${userId}/status`,
      { isActive: newStatus }, // ✅ Gửi trạng thái mới
      { headers: authHeader() }
    );
    console.log("✅ API Response:", response.data); // Debug API
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái:", error);
    throw error;
  }
};
