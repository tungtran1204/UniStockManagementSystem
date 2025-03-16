import { useState, useEffect } from "react";
import { fetchWarehouses, updateWarehouseStatus, createWarehouse, updateWarehouse } from "./warehouseService";
console.log("createWarehouse:", createWarehouse); 

const useWarehouse = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1); 
  const [pageSize, setPageSize] = useState(10);

  const fetchPaginatedWarehouses = async (page = currentPage, size = pageSize) => {
    try {
      const response = await fetchWarehouses(page, size);
      console.log("Fetched warehouses:", response.data); // Log fetched warehouses
      console.log("Total pages:", response.totalPages); // Log total pages
      console.log("Total elements:", response.totalElements); // Log total elements
      setWarehouses(response.data || []); // Ensure warehouses is always an array
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);

      setCurrentPage(page);
      setPageSize(size);
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  const fetchListWarehouses = async () => {
    try {
      const response = await getWarehouseList();
      console.log("Fetched warehouses:", response.data); // Log fetched warehouses
      setWarehouses(response.data || []); // Ensure warehouses is always an array
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };
  
  const toggleStatus = async (warehouseId, isActive) => {
    try {
      const newStatus = !isActive; 
      console.log(`Updating warehouse ${warehouseId}, new status: ${newStatus}`);
      await updateWarehouseStatus(warehouseId, newStatus);
      await fetchPaginatedWarehouses(currentPage, pageSize);
    } catch (error) {
      console.error("Error updating warehouse status:", error);
    }
};

  const editWarehouse = async (warehouseId, updatedWarehouse) => {
    try {
      console.log(`Updating warehouse ${warehouseId}:`, updatedWarehouse);
      const response = await updateWarehouse(warehouseId, updatedWarehouse);
      fetchPaginatedWarehouses();
      return response;
    } catch (error) {
      console.error("Error updating warehouse:", error);
      throw error;
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
    addWarehouse,
    editWarehouse,
    fetchListWarehouses,
  };
};

export default useWarehouse;