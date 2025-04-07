import axios from "axios";

const API_URL_IN_RP = "http://localhost:8080/api/unistock/user/inventory";
//const API_URL_IN_RP = `${import.meta.env.VITE_API_URL}/user/inventory`;

// Helper function to get the authorization header
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getInventoryReportPaginated = (page = 0, size = 20) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL_IN_RP }/report?page=${page}&size=${size}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const API_URL_GRN_RP = "http://localhost:8080/api/unistock/user/receiptnote";
//const API_URL_IN_RP = `${import.meta.env.VITE_API_URL}/user/receiptnote`;
export const getGoodReceiptReportPaginated = (page = 0, size = 10) => {
  const token = localStorage.getItem("token");
  return axios.get(`${API_URL_GRN_RP}/report?page=${page}&size=${size}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const API_URL_GIN_RP = "http://localhost:8080/api/unistock/user/issuenote";
//const API_URL_GIN_RP = `${import.meta.env.VITE_API_URL}/user/issuenote`;
export const getGoodIssueReportPaginated = (page = 0, size = 10) => {
  const token = localStorage.getItem("token");

  return axios.get(`${API_URL_GIN_RP}/report?page=${page}&size=${size}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
