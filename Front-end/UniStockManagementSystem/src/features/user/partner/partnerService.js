import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";


const API_URL = "http://localhost:8080/api/unistock/user/partner";
const TYPE_API = "http://localhost:8080/api/unistock/user/partner/type";
const CODE_API = "http://localhost:8080/api/unistock/user/partner/code";

const authHeader = () => {
    const token = localStorage.getItem("token");

    if (!token) {
        console.warn("🚨 Không tìm thấy token trong localStorage!");
        return {};
    }

    console.log("🔑 Gửi Token:", token);
    return { Authorization: `Bearer ${token}` };
};

// ✅ Lấy danh sách tất cả đối tác
export const getAllPartners = async () => {
    try {
        const headers = authHeader();
        console.log("📢 [getPartners] Headers:", headers);
        const response = await axios.get(`${API_URL}/list`, { headers });
        return response.data;
    } catch (error) {
        console.error("Failed to fetch partners", error);
        if (error.response) {
            console.error("🔴 [getPartners] Response Data:", error.response.data);
            console.error("🔴 [getPartners] Status Code:", error.response.status);
            console.error("🔴 [getPartners] Headers:", error.response.headers);
        }

        throw error;
    }
};

export const fetchPartnerTypes = async () => {
    try {
        const headers = authHeader();
        console.log("📢 [getPartnerTypes] Headers:", headers);
        const response = await axios.get(TYPE_API, { headers });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy danh sách nhóm đối tác:', error);
        if (error.response) {
            console.error("🔴 [getPartnerTypes] Response Data:", error.response.data);
            console.error("🔴 [getPartnerTypes] Status Code:", error.response.status);
            console.error("🔴 [getPartnerTypes] Headers:", error.response.headers);
        }
        throw error;
    }
};

export const createPartner = async (partner) => {
    const response = await axios.post(`${API_URL}/add`, partner, {
      headers: authHeader(),
    });
  
    console.log("✅ Kết quả từ Server:", response.data);
    return response.data;
};

export const getPartnerCodeByType = async (typeId) => {
    try {
        const headers = authHeader();
        const response = await axios.get(`${CODE_API}/${typeId}`, { headers });
        return response.data; // Trả về mã đối tác đã được tạo
    } catch (error) {
        console.error("Lỗi khi lấy mã đối tác:", error);
        throw error;
    }
};

