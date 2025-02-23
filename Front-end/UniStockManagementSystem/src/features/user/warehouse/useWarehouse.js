import { useState, useEffect } from "react";
import { fetchWarehouses } from "./warehouseService";

// Custom hook to manage warehouse state and fetch warehouses
const useWarehouse = () => {
  const [warehouses, setWarehouses] = useState([]);

  const fetchWarehousesData = async () => {
    try {
      const data = await fetchWarehouses();
      setWarehouses(data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách kho:", error);
    }
  };

  useEffect(() => {
    fetchWarehousesData();
  }, []);

  return {
    warehouses,
    fetchWarehouses: fetchWarehousesData,
  };
};

export default useWarehouse;