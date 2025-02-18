import axios from "axios";

const API_URL = "http://localhost:8080/api/unistock/admin/roles"; // ✅ API cho Role Management

// ✅ Hàm để lấy Token từ LocalStorage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {}; // ✅ Nếu không có token, trả về object rỗng
};

// 🟢 **Lấy danh sách Vai Trò**
export const getAllRoles = async () => {
  try {
    const response = await axios.get(API_URL, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách Vai Trò:", error);
    throw error;
  }
};

// 🟢 **Thêm Vai Trò mới**
export const addRole = async (role) => {
  try {
    const response = await axios.post(API_URL, role, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi thêm Vai Trò:", error);
    throw error;
  }
};

// 🟢 **Cập nhật Vai Trò**
export const updateRole = async (id, updatedRole) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updatedRole, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật Vai Trò:", error);
    throw error;
  }
};

// 🔄 **Toggle trạng thái `isActive` của Vai Trò**
export const toggleRoleStatus = async (id, newStatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${id}/status`,
      { active: newStatus },
      { headers: authHeader() }
    );
    console.log("✅ API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái Vai Trò:", error);
    throw error;
  }
};

// 🔴 **Xóa Vai Trò theo ID**
export const deleteRole = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
  } catch (error) {
    console.error("❌ Lỗi khi xóa Vai Trò:", error);
    throw error;
  }
};
