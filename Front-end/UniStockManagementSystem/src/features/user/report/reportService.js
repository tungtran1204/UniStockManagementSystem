import axios from "axios";

const API_URL = "http://localhost:8080/api/unistock/user/inventory";
//const API_URL = `${import.meta.env.VITE_API_URL}/user/inventory/report`;

// Helper function to get the authorization header
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getInventoryReportPaginated = (page = 0, size = 20) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL }/report?page=${page}&size=${size}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

