import React, { useState, useEffect } from "react";
import { getSaleOrders, deleteSaleOrder } from "./saleOrdersService";
import ModalAddSaleOrder from "./ModalAddSaleOrder";
import ModalEditSaleOrder from "./ModalEditSaleOrder";

const SaleOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getSaleOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders", error);
    }
  };

  const handleEdit = (order) => {
    setSelectedOrder(order);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (orderId) => {
    if (window.confirm("Bạn có chắc muốn xóa đơn hàng này?")) {
      await deleteSaleOrder(orderId);
      fetchOrders();
    }
  };

  return (
    <div>
      <h1>Quản lý Đơn Hàng</h1>
      <button onClick={() => setIsAddModalOpen(true)}>Thêm Đơn Hàng</button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách hàng</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Ngày đặt hàng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.orderId}>
              <td>{order.orderId}</td>
              <td>{order.customerName}</td>
              <td>{order.totalAmount}</td>
              <td>{order.status}</td>
              <td>{order.orderDate}</td>
              <td>
                <button onClick={() => handleEdit(order)}>Sửa</button>
                <button onClick={() => handleDelete(order.orderId)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isAddModalOpen && (
        <ModalAddSaleOrder
          onClose={() => setIsAddModalOpen(false)}
          onAdded={fetchOrders}
        />
      )}

      {isEditModalOpen && selectedOrder && (
        <ModalEditSaleOrder
          order={selectedOrder}
          onClose={() => setIsEditModalOpen(false)}
          onUpdated={fetchOrders}
        />
      )}
    </div>
  );
};

export default SaleOrdersPage;
