import axios from "axios";

const API_URL = "http://localhost:8080/api/unistock/user/sale-orders"; // ✅ API Sale Orders

// ✅ Hàm để lấy Token từ LocalStorage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 🟢 **Lấy danh sách Sale Orders (Hỗ trợ phân trang)**
export const getSaleOrders = async (page, size) => {
  try {
    const response = await axios.get(API_URL, {
      params: { page, size },
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("❌ [getSaleOrders] Lỗi khi lấy danh sách đơn hàng:", error);
    throw error;
  }
};

export const getNextOrderCode = async () => {
  try {
    const response = await axios.get(`${API_URL}/next-code`, {
      headers: authHeader(),
    });
    return response.data; // Mã đơn hàng, ví dụ "ĐH00003"
  } catch (error) {
    console.error("❌ [getNextOrderCode] Lỗi:", error);
    throw error;
  }
};

// 🟢 **Lấy chi tiết Sale Order theo ID**
export const getSaleOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_URL}/${orderId}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("❌ [getSaleOrderById] Lỗi khi lấy đơn hàng:", error);
    throw error;
  }
};

// 🟢 **Tạo mới Sale Order**
export const createSaleOrder = async (orderData) => {
  try {
    const response = await axios.post(API_URL, orderData, {
      headers: { ...authHeader(), "Content-Type": "application/json" },
    });
    console.log("✅ [createSaleOrder] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ [createSaleOrder] Lỗi khi tạo đơn hàng:", error);
    throw error;
  }
};

// 🟢 **Cập nhật Sale Order**
export const updateSaleOrder = async (orderId, orderData) => {
  try {
    const response = await axios.put(`${API_URL}/${orderId}`, orderData, {
      headers: { ...authHeader(), "Content-Type": "application/json" },
    });
    console.log("✅ [updateSaleOrder] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ [updateSaleOrder] Lỗi khi cập nhật đơn hàng:", error);
    throw error;
  }
};

// 🔴 **Xóa Sale Order**
export const deleteSaleOrder = async (orderId) => {
  try {
    await axios.delete(`${API_URL}/${orderId}`, { headers: authHeader() });
    console.log(`✅ [deleteSaleOrder] Đã xóa đơn hàng có ID: ${orderId}`);
  } catch (error) {
    console.error("❌ [deleteSaleOrder] Lỗi khi xóa đơn hàng:", error);
    throw error;
  }
};

// 🔄 **Toggle trạng thái Sale Order**
export const toggleSaleOrderStatus = async (orderId, newStatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${orderId}/status`,
      { status: newStatus },
      { headers: authHeader() }
    );
    console.log("✅ [toggleSaleOrderStatus] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ [toggleSaleOrderStatus] Lỗi khi cập nhật trạng thái:", error);
    throw error;
  }
};

// 📥 **Import Sale Orders từ Excel**
export const importSaleOrders = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(`${API_URL}/import`, formData, {
      headers: {
        ...authHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("✅ [importSaleOrders] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ [importSaleOrders] Lỗi khi import đơn hàng:", error);
    throw error;
  }
};

// 📤 **Export Sale Orders ra Excel**
export const exportSaleOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/export`, {
      responseType: "blob",
      headers: authHeader(),
    });

    // ✅ Tạo link tải file Excel
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "SaleOrders.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("✅ [exportSaleOrders] Đã xuất file Excel.");
    return true;
  } catch (error) {
    console.error("❌ [exportSaleOrders] Lỗi khi xuất đơn hàng:", error);
    throw error;
  }
};
