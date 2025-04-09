import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const API_URL = `${import.meta.env.VITE_API_URL}/user/material-types`;

// Hàm để lấy Token từ LocalStorage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};


// lấy danh sách loại vật tư đang sử dụng
export const fetchActiveMaterialTypes = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/active`,
      { headers: authHeader() }
    );
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách loại vật tư đang sử dụng:", error);
    throw error;
  }
};