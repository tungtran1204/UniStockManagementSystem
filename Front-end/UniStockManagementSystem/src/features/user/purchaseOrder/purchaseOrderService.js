import axios from "axios";

const API_URL = "http://localhost:8080/api/unistock/user/purchases"; // URL API backend

// take token from local storage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {}; // If there is no token, return an empty object
};

export const fetchAllPurchaseOrders = async (page, size) => {
  try {
    const response = await axios.get(`${API_URL}?page=${page}&size=${size}`, { headers: authHeader() });
    console.log("Dữ liệu đơn mua hàng:", response.data); // Kiểm tra dữ liệu trả về từ API
    return {
      data: response.data.content,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn mua:", error);
    throw error;
  }
};

const purchaseOrderService = {
  // Lấy danh sách tất cả đơn hàng
  getAllOrders: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching purchase orders", error);
      throw error;
    }
  },

  // Lấy thông tin một đơn hàng theo ID
  getOrderById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching purchase order ${id}`, error);
      throw error;
    }
  },

  // Tạo một đơn hàng mới
  createOrder: async (orderData) => {
    try {
      const response = await axios.post(API_BASE_URL, orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating purchase order", error);
      throw error;
    }
  }
};

export default purchaseOrderService;
