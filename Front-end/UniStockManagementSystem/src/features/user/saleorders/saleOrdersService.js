import axios from "axios";

const API_URL = "http://localhost:8080/api/unistock/user/sale-orders";

// Lấy danh sách đơn hàng
export const getSaleOrders = async () => {
  try {
      const response = await axios.get(API_URL);
      return response.data;
  } catch (error) {
      console.error("Error fetching sale orders:", error);
      throw error;
  }
};

// Thêm đơn hàng mới
export const createSaleOrder = async (product, token) => {

  const response = await axios.post(API_URL, orderData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  console.log("✅ Kết quả từ Server:", response.data);
  return response.data;
};

// Cập nhật đơn hàng
export const updateSaleOrder = async (orderId, updatedData) => {
  try {
      const response = await axios.put(`${API_URL}/${orderId}`, updatedData,{
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.data;
  } catch (error) {
      console.error("Error updating sale order:", error);
      throw error;
  }
};

// Xóa đơn hàng
export const deleteSaleOrder = async (orderId) => {
  try {
      await axios.delete(`${API_URL}/${orderId}`);
  } catch (error) {
      console.error("Error deleting sale order:", error);
      throw error;
  }
};


