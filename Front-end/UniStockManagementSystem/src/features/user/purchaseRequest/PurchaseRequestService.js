import axios from "axios";
const API_URL = `${import.meta.env.VITE_API_URL}/user/purchase-requests`;

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getPurchaseRequests = async (page, size) => {
  try {
    const response = await axios.get(API_URL, {
      params: { page, size },
      headers: authHeader(),
    });
    console.log("✅ [getPurchaseRequests] API Response:", response.data);
    if (response.data && response.data.content) {
      return {
        ...response.data,
        content: response.data.content.map((request) => ({
          ...request,
          status: mapStatusToVietnamese(request.status),
          partnerName: request.partner?.partnerName || request.partnerName || "Không xác định",
        })),
      };
    }
    return response.data;
  } catch (error) {
    console.error("❌ [getPurchaseRequests] Error:", error);
    throw error;
  }
};

const mapStatusToVietnamese = (status) => {
  const statusMap = {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt",
    REJECTED: "Từ chối",
    CANCELLED: "Đã hủy",
  };
  return statusMap[status] || status;
};

export const getNextRequestCode = async () => {
  try {
    const response = await axios.get(`${API_URL}/next-code`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("❌ [getNextRequestCode] Error:", error);
    throw error;
  }
};

export const createPurchaseRequest = async (requestData) => {
  try {
    const response = await axios.post(`${API_URL}/manual`, requestData, { // Thay đổi endpoint
      headers: authHeader(),
    });
    console.log("✅ [createPurchaseRequest] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ [createPurchaseRequest] Error:", error.response?.data || error.message);
    throw error;
  }
};

export const togglePurchaseRequestStatus = async (requestId, newStatus) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${requestId}/status`,
      { status: newStatus },
      { headers: authHeader() }
    );
    console.log("✅ [togglePurchaseRequestStatus] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ [togglePurchaseRequestStatus] Error:", error);
    throw error;
  }
};