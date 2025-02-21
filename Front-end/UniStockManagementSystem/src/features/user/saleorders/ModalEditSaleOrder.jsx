import React, { useState } from "react";
import { updateSaleOrder } from "./saleOrdersService";

const ModalEditSaleOrder = ({ order, onClose, onUpdated }) => {
  const [updatedOrder, setUpdatedOrder] = useState(order);

  const handleChange = (e) => {
    setUpdatedOrder({ ...updatedOrder, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSaleOrder(order.orderId, updatedOrder);
    onUpdated();
    onClose();
  };

  return (
    <div className="modal">
      <h2>Chỉnh sửa Đơn Hàng</h2>
      <form onSubmit={handleSubmit}>
        <input name="customerName" value={updatedOrder.customerName} onChange={handleChange} required />
        <input name="totalAmount" type="number" value={updatedOrder.totalAmount} onChange={handleChange} required />
        <input name="orderDate" type="date" value={updatedOrder.orderDate} onChange={handleChange} required />
        <button type="submit">Lưu</button>
        <button onClick={onClose}>Hủy</button>
      </form>
    </div>
  );
};

export default ModalEditSaleOrder;
