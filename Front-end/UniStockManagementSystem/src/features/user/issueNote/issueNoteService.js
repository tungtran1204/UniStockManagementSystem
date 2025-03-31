import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/user/issuenote`; // ✅ API Sale Orders

// ✅ Hàm để lấy Token từ LocalStorage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🟢 **Lấy danh sách Sale Orders (Hỗ trợ phân trang)**
export const getSaleOrders = async (page, size) => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/sale-orders`, {
      params: { page, size },
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("❌ [getSaleOrders] Lỗi khi lấy danh sách đơn hàng:", error);
    throw error;
  }
};

export const createIssueNote = async (issueNote) => {
    try {
      const response = await axios.post(API_URL, issueNote, {
        headers: { ...authHeader(), "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating receipt note:", error);
      throw error;
    }
  };

  export const getNextCode = async () => {
    try {
      const response = await axios.get(`${API_URL}/nextcode`, {
        headers: authHeader(),
      });
      return response.data; 
    } catch (error) {
      console.error("Error getting next receipt note code:", error);
      throw error;
    }
  };