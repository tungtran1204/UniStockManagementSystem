import axios from "axios";

const API_URL = "http://localhost:8080/api/unistock/user/receiptnote";

// Helper function to get the authorization header
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch paginated receipt notes
export const fetchReceiptNotes = async (page, size) => {
  try {
    const response = await axios.get(`${API_URL}?page=${page}&size=${size}`, {
      headers: authHeader(),
    });
    return {
      data: response.data.content,
      totalPages: response.data.totalPages,
      totalElements: response.data.totalElements,
    };
  } catch (error) {
    console.error("Error fetching receipt notes:", error);
    throw error;
  }
};

// Create a new receipt note
export const createReceiptNote = async (receiptNote) => {
  try {
    const response = await axios.post(API_URL, receiptNote, {
      headers: { ...authHeader(), "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating receipt note:", error);
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

// Update an existing receipt note
export const updateReceiptNote = async (receiptNoteId, receiptNote) => {
  try {
    const response = await axios.put(`${API_URL}/${receiptNoteId}`, receiptNote, {
      headers: { ...authHeader(), "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating receipt note:", error);
    throw error;
  }
};

// Delete a receipt note
export const deleteReceiptNote = async (receiptNoteId) => {
  try {
    const response = await axios.delete(`${API_URL}/${receiptNoteId}`, {
      headers: authHeader(),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting receipt note:", error);
    throw error;
  }
};