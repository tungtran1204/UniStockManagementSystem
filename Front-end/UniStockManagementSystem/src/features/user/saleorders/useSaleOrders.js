import { useState, useEffect } from "react";
import { getSaleOrders } from "./saleOrdersService";

const useSaleOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const data = await getSaleOrders();
    setOrders(data);
  };

  return { orders, fetchOrders };
};

export default useSaleOrders;
