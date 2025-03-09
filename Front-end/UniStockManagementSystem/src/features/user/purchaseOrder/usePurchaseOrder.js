import { useState, useEffect } from "react";
import purchaseOrderService from "../services/purchaseOrderService";

const usePurchaseOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch danh sách đơn hàng
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await purchaseOrderService.getAllOrders();
      setOrders(data);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch một đơn hàng theo ID
  const fetchOrderById = async (id) => {
    setLoading(true);
    try {
      return await purchaseOrderService.getOrderById(id);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  // Tạo một đơn hàng mới
  const createOrder = async (orderData) => {
    setLoading(true);
    try {
      const newOrder = await purchaseOrderService.createOrder(orderData);
      setOrders((prevOrders) => [...prevOrders, newOrder]); // Cập nhật danh sách
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    createOrder
  };
};

export default usePurchaseOrder;
