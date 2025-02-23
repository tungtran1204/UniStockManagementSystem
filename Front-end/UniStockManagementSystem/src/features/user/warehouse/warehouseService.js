import axios from "axios";

// API endpoint for warehouses
const API_URL = "http://localhost:8080/api/unistock/user/warehouses";

// Fetch all warehouses
export const fetchWarehouses = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Thêm token xác thực
      },
    });
    console.log("Dữ liệu kho:", response.data); // Kiểm tra dữ liệu trả về từ API
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách kho:", error);
    throw error;
  }
};

// Create a new warehouse
export const createWarehouse = async (warehouse) => {
  try {
    const response = await axios.post(API_URL, warehouse);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo kho:", error);
    throw error;
  }
};

// Update warehouse status by ID
export const updateWarehouseStatus = async (warehouseId) => {
  try {
    const response = await axios.patch(`${API_URL}/${warehouseId}/status`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thay đổi trạng thái kho:", error);
    throw error;
  }
};

// Update warehouse information by ID
export const updateWarehouse = async (warehouseId, warehouse) => {
  try {
    const response = await axios.put(`${API_URL}/${warehouseId}`, warehouse, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Thêm token xác thực
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin kho:", error);
    throw error;
  }
};