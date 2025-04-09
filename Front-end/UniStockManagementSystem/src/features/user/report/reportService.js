import axios from "axios";

const API_URL_IN_RP = "http://localhost:8080/api/unistock/user/inventory";
//const API_URL_IN_RP = `${import.meta.env.VITE_API_URL}/user/inventory`;

// Helper function to get the authorization header
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getInventoryReportPaginated = ({
  page = 0,
  size = 20,
  search = "",
  warehouses = [],
  statuses = [],
  quantityFilters = {},
  itemType = "",
  productTypeIds = [],
  materialTypeIds = [],
}) => {
  const token = localStorage.getItem("token");
  const params = new URLSearchParams();

  params.append("page", page);
  params.append("size", size);
  if (search) params.append("search", search);

  warehouses.forEach((wh) => params.append("warehouseIds", wh.warehouseId));
  statuses.forEach((s) => params.append("statuses", s));
  if (itemType) params.append("itemType", itemType);
  productTypeIds.forEach((id) => params.append("productTypeIds", id));
  materialTypeIds.forEach((id) => params.append("materialTypeIds", id));

  const quantityFields = [
    { key: "itemAvailableQuantity", paramMin: "minAvailable", paramMax: "maxAvailable" },
    { key: "itemReservedQuantity", paramMin: "minReserved", paramMax: "maxReserved" },
    { key: "itemRealQuantity", paramMin: "minTotal", paramMax: "maxTotal" },
  ];

  quantityFields.forEach(({ key, paramMin, paramMax }) => {
    const filter = quantityFilters[key];
    if (filter) {
      if (filter.min !== null) params.append(paramMin, filter.min);
      if (filter.max !== null) params.append(paramMax, filter.max);
    }
  });

  return axios.get(`${API_URL_IN_RP}/report?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
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
