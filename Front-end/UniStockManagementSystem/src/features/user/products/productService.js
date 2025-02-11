import axios from "axios";

const API_URL = "http://localhost:8080/api/unistock/user/products";

export const getAllProducts = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getUserProducts = async (userId) => {
  const response = await axios.get(`${API_URL}/${userId}`);
  return response.data;
};

export const createProduct = async (userId, product) => {
  const response = await axios.post(`${API_URL}/${userId}`, product);
  return response.data;
};

export const updateProduct = async (userId, productId, product) => {
  const response = await axios.put(`${API_URL}/${userId}/${productId}`, product);
  return response.data;
};

export const deleteProduct = async (userId, productId) => {
  await axios.delete(`${API_URL}/${userId}/${productId}`);
};
