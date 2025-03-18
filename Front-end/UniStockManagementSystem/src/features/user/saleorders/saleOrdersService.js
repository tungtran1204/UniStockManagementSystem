import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/user/sale-orders`; // ✅ API Sale Orders

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


export const addSaleOrder = async (orderData) => {
  try {
    const response = await axios.post(API_URL, orderData, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("❌ [addSaleOrder] Lỗi khi thêm đơn hàng:", error);
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



export const getProducts = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/user/products`, {headers: authHeader(),}
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sản phẩm:", error);
    throw error;
  }
};

export const updateOrder = async (orderId, orderData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${orderId}`,
      orderData,
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật đơn hàng:", error);
    throw error; 
  }
  
};