import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/user/product-types`;

const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fetchProductTypes = async (page = 0, size = 10) => {
    try {
        const response = await axios.get(API_URL, {
            headers: authHeader(),
            params: {
                page,
                size,
            },
        });
        console.log("📌 [fetchProductTypes] API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách dòng sản phẩm:", error.response?.data || error.message);
        throw error;
    }
};

export const toggleStatus = async (typeId, newStatus) => {
    try {
        const response = await axios.patch(
            `${API_URL}/${typeId}/toggle-status`,
            { status: newStatus },
            { headers: authHeader() }
        );
        console.log("✅ [toggleStatus] API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi thay đổi trạng thái:", error.response?.data || error.message);
        throw error;
    }
};

export const createProductType = async (productTypeData) => {
    try {
        const response = await axios.post(API_URL, productTypeData, {
            headers: authHeader(),
        });
        console.log("✅ [createProductType] API Response:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi tạo dòng sản phẩm:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || "Lỗi khi tạo dòng sản phẩm");
    }
};

//lấy danh sách dòng sản phẩm đang hoạt động
export const fetchActiveProductTypes = async () => {
    try {
        const response = await axios.get(`${API_URL}/active`, {
            headers: authHeader(),
        });
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách dòng sản phẩm đang hoạt động:", error);
        throw error;
    }
};