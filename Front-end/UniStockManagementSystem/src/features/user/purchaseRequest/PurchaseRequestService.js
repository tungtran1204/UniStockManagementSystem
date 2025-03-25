import axios from "axios";
const API_URL = `${import.meta.env.VITE_API_URL}/user/purchase-requests`;

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getPurchaseRequests = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URL}`, {
      params: {
        page: page,
        size: size,
        sort: "createdDate,desc" // Thêm sort để tránh lỗi
      },
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      withCredentials: true, // Thêm withCredentials
    });

    if (response.data && response.data.content) {
      return {
        ...response.data,
        content: response.data.content.map((request) => ({
          id: request.purchaseRequestId, // Thêm id để tránh lỗi undefined
          ...request,
          status: mapStatusToVietnamese(request.status),
          partnerName: request.partner?.partnerName || request.partnerName || "Không xác định",
        })),
      };
    }
    return response.data;
  } catch (error) {
    console.error("❌ [getPurchaseRequests] Error:", error);
    // Return empty data instead of throwing error
    return {
      content: [],
      totalPages: 0,
      totalElements: 0,
      size: size,
      number: page
    };
  }
};

const mapStatusToVietnamese = (status) => {
  const statusMap = {
    PENDING: "Chờ duyệt",
    CONFIRMED: "Đã duyệt",
    CANCELLED: "Từ chối",
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

export const updatePurchaseRequestStatus = async (purchaseRequestId, newStatus) => {
  try {
    const response = await axios.put(`${API_URL}/${purchaseRequestId}/status?status=${newStatus}`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái yêu cầu:", error);
    throw error;
  }
};

export const createPurchaseRequestFromSaleOrder = async (saleOrderId) => {
  try {
    const response = await axios.post(
      `${API_URL}/sale-order/${saleOrderId}`,
      {},
      {
        headers: {
          ...authHeader(),
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo yêu cầu mua vật tư:", error);
    throw error;
  }
};


export const getPurchaseRequestById = async (purchaseRequestId) => {
  try {
    const response = await axios.get(`${API_URL}/${purchaseRequestId}`, {
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });

    // Ánh xạ dữ liệu trả về để đồng bộ với các hàm khác
    const data = response.data;
    return {
      ...data,
      status: mapStatusToVietnamese(data.status), // Ánh xạ trạng thái sang tiếng Việt
      purchaseRequestDetails: data.purchaseRequestDetails.map((detail) => ({
        ...detail,
        partnerName: detail.partnerName || "Không xác định", // Đảm bảo partnerName không bị undefined
      })),
    };
  } catch (error) {
    console.error("❌ [getPurchaseRequestById] Error:", error.response?.data || error.message);
    throw error;
  }
};