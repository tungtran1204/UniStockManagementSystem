import axios from "axios";

// API endpoint for warehouses
const API_URL = `${import.meta.env.VITE_API_URL}/user/warehouses`;

// take token from local storage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {}; // If there is no token, return an empty object
};


// Fetch all warehouses
export const fetchWarehouses = async (page, size) => {
  try {
    const response = await axios.get(`${API_URL}?page=${page}&size=${size}`, { headers: authHeader() });
    console.log("Dữ liệu kho:", response.data); // Kiểm tra dữ liệu trả về từ API
    return {
      data: response.data.content,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
    };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách kho:", error);
    throw error;
  }
};

// Create a new warehouse
export const createWarehouse = async (warehouse) => {
  try {
    const response = await axios.post(API_URL, warehouse,{ headers: { ...authHeader(), "Content-Type": "application/json" }, } );
    console.log("[createUser] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo kho:", error);
    throw error;
  }
};

// Update warehouse status by ID
export const updateWarehouseStatus = async (warehouseId, newStatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${warehouseId}/status`,
      { isActive: newStatus }, 
      { headers: { ...authHeader(), "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thay đổi trạng thái kho:", error);
    throw error;
  }
};

// Update warehouse information by ID
export const updateWarehouse = async (warehouseId, warehouse) => {
  try {
    const response = await axios.patch(`${API_URL}/${warehouseId}`, warehouse, { headers: { ...authHeader(), "Content-Type": "application/json" }, });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật thông tin kho:", error);
    throw error;
  }
};

// Get warehouse by ID
export const getWarehouseById = async (warehouseId) => {
  try {
    const response = await axios.get(`${API_URL}/${warehouseId}`, { headers: { ...authHeader(), "Content-Type": "application/json" }, });
    return response.data;
  } catch (error) {
    console.error(" Error fetching warehouse by ID:", error);
    throw error;
  }
};