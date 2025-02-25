import { useState, useEffect } from "react";
import { fetchWarehouses, updateWarehouseStatus, createWarehouse } from "./warehouseService";
console.log("createWarehouse:", createWarehouse); 

const useWarehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchPaginatedWarehouses = async (page, size) => {
    try {
      const response = await fetchWarehouses(page, size);
      console.log("Fetched warehouses:", response.data); // Log fetched warehouses
      console.log("Total pages:", response.totalPages); // Log total pages
      console.log("Total elements:", response.totalElements); // Log total elements
      setWarehouses(response.data || []); // Ensure warehouses is always an array
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };
  
  const toggleStatus = async (warehouseId, isActive) => {
    try {
      await updateWarehouseStatus(warehouseId, !isActive);
      fetchPaginatedWarehouses();
    } catch (error) {
      console.error("Error updating warehouse status:", error);
    }
  };

  const addWarehouse = async (warehouse) => {
    try {
      const response = await createWarehouse(warehouse);
      fetchPaginatedWarehouses();
      return response;
    } catch (error) {
      console.error("Error creating warehouse:", error);
      throw error;
    }
  };

  return {
    warehouses,
    fetchPaginatedWarehouses,
    toggleStatus,
    totalPages,
    totalElements,
    addWarehouse
  };
};

export default useWarehouse;