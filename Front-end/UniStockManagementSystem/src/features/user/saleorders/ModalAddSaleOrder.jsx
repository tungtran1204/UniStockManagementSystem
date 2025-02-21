import React, { useState } from "react";
import { createSaleOrder } from "./saleOrdersService";

const ModalAddSaleOrder = ({ onClose, onAdded }) => {
  const [order, setOrder] = useState({
    customerName: "",
    totalAmount: 0,
    status: "Pending",
    orderDate: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setOrder({ ...order, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createSaleOrder(order);
    onAdded();
    onClose();
  };

  return (
    <div className="modal">
      <h2>Thêm Đơn Hàng</h2>
      <form onSubmit={handleSubmit}>
        <input name="customerName" placeholder="Tên khách hàng" onChange={handleChange} required />
        <input name="totalAmount" type="number" placeholder="Tổng tiền" onChange={handleChange} required />
        <input name="orderDate" type="date" onChange={handleChange} required />
        <button type="submit">Thêm</button>
        <button onClick={onClose}>Hủy</button>
      </form>
    </div>
  );
};

export default ModalAddSaleOrder;
