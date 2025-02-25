import axios from "axios";

const API_URL = "http://localhost:8080/api/unistock/user/sale-orders";

const authHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("🚨 Không tìm thấy token trong localStorage!");
    return {};
  }

  console.log("🔑 Gửi Token:", token);
  return { Authorization: `Bearer ${token}` };
};

// Lấy danh sách đơn hàng
export const getSaleOrders = async () => {
  try {
      const headers = authHeader();
      console.log("📢 [getSaleOrders] Headers:", headers);
      const response = await axios.get(API_URL, { headers });
      return response.data;
  } catch (error) {
      console.error("Error fetching sale orders:", error);
      if (error.response) {
          console.error("🔴 [getAllSaleOrders] Response Data:", error.response.data);
          console.error("🔴 [getAllSaleOrders] Status Code:", error.response.status);
          console.error("🔴 [getAllSaleOrders] Headers:", error.response.headers);
      }
      throw error;
  }
};

// Thêm đơn hàng mới
export const createSaleOrders = async (orderData, token) => {
  const response = await axios.post(`${API_URL}/add`, orderData, {
    headers: authHeader(),
  });

  console.log("✅ Kết quả từ Server:", response.data);
  return response.data;
};

// Cập nhật đơn hàng
export const updateSaleOrders = async (orderId, updatedData) => {
  try {
      const response = await axios.put(`${API_URL}/${orderId}`, updatedData,{
        headers: authHeader(),
      });
      console.log("✅ Kết quả từ Server:", response.data);
      return response.data;
  } catch (error) {
      console.error("Error updating sale order:", error);
      throw error;
  }
};

// Xóa đơn hàng
export const deleteSaleOrders = async (orderId) => {
  try {
      const response = await axios.delete(`${API_URL}/${orderId}`,{
        headers: authHeader(),
      });
      console.log("✅ Kết quả từ Server:", response.data);
      return response.data;
  } catch (error) {
      console.error("Error deleting sale order:", error);
      throw error;
  }
};

export const exportSaleOrders = async () => {
  const response = await api.get("/sale-orders/export", { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "SaleOrders.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const importSaleOrders = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post("/sale-orders/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const toggleSaleOrdersStatus = async (typeId, newStatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${typeId}/status`,
      { status: newStatus },
      { headers: authHeader() }
    );
    console.log("✅ API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật trạng thái:", error);
    throw error;
  }
};
