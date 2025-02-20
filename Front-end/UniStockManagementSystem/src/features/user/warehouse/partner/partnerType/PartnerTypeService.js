import axios from "axios";

const API_URL = "http://localhost:8080/api/unistock/user/partner/type";

export const getPartnerTypes = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch partner types", error);
    throw error;
  }
};

export const createPartnerType = async (partnerType, token) => {

    const response = await axios.post(`${API_URL}/add`, partnerType, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    console.log("✅ Kết quả từ Server:", response.data);
    return response.data;
  };

  export const updatePartnerType = async (partnerType, token) => {

    const response = await axios.put(`${API_URL}/edit/${partnerType.typeId}`, partnerType, {
      headers: { Authorization: `Bearer ${token}` },
    });
  
    console.log("✅ Kết quả từ Server:", response.data);
    return response.data;
  };
