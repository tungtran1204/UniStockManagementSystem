import axios from 'axios';

const API_URL = 'http://localhost:8080/api/unistock/user/rscates';

export const getResourceCategories = async () => {
  // Fetch all resource categories from the backend
  const response = await axios.get(API_URL);
  return response.data;
};

export const createResourceCategory = async (category) => {
  // Create a new resource category
  const response = await axios.post(API_URL, category);
  return response.data;
};

export const updateResourceCategory = async (id, category) => {
  // Update an existing resource category
  const response = await axios.put(`${API_URL}/${id}`, category);
  return response.data;
};

export const deleteResourceCategory = async (id) => {
  // Delete a resource category
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};