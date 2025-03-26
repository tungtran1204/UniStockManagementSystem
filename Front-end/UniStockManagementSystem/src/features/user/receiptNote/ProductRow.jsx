import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Option
} from "@material-tailwind/react";

// Hàm kiểm tra số lượng nhập hợp lệ
const isValidQuantity = (inputQty, orderedQty, receivedQty) => {
  const remaining = orderedQty - receivedQty;
  if (remaining <= 0) return false; // Đã nhập đủ hoặc dư
  const maxAllowed = Math.floor(remaining * 1.01);
  const qty = parseInt(inputQty, 10) || 0;
  return qty >= 1 && qty <= maxAllowed;
};

const ProductRow = ({ item, index, warehouses, defaultWarehouseCode, currentPage, pageSize, onDataChange }) => {
  const [warehouse, setWarehouse] = useState(defaultWarehouseCode || '');
  const [quantity, setQuantity] = useState('');
  const [quantityError, setQuantityError] = useState('');
  const [remainingQuantity, setRemainingQuantity] = useState(
    Math.max(0, item.orderedQuantity - item.receivedQuantity)
  );

  useEffect(() => {
    setWarehouse(defaultWarehouseCode);
  }, [defaultWarehouseCode]);

  const updateRemainingQuantity = (inputQty) => {
    const numInputQty = parseInt(inputQty, 10) || 0;
    const remaining = Math.max(0, item.orderedQuantity - item.receivedQuantity - numInputQty);
    setRemainingQuantity(remaining);
    return remaining;
  };

  const handleWarehouseChange = (value) => {
    setWarehouse(value);
    const warehouseObj = warehouses.find(w => w.warehouseCode === value);
    const warehouseId = warehouseObj ? warehouseObj.warehouseId : null;

    const itemKey = item.materialId || item.productId;
    onDataChange(itemKey, {
      warehouse: value,
      warehouseId,
      quantity,
      orderedQuantity: item.orderedQuantity,
      receivedQuantity: item.receivedQuantity,
      remainingQuantity,
      error: quantityError
    });
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;

    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
      const ordered = item.orderedQuantity || 0;
      const received = item.receivedQuantity || 0;
      const remaining = ordered - received;

      let error = '';
      if (remaining <= 0) {
        error = 'Đã nhập đủ số lượng';
      } else if (value === '') {
        error = 'Số lượng nhập không được để trống';
      } else if (!isValidQuantity(value, ordered, received)) {
        const max = Math.floor((ordered - received) * 1.01);
        error = `Số lượng phải từ 1 đến tối đa ${max}`;
      }

      setQuantityError(error);
      const remainingQty = updateRemainingQuantity(value);

      const itemKey = item.materialId || item.productId;
      const warehouseObj = warehouses.find(w => w.warehouseCode === warehouse);
      const warehouseId = warehouseObj ? warehouseObj.warehouseId : null;

      onDataChange(itemKey, {
        warehouse,
        warehouseId,
        quantity: value,
        orderedQuantity: ordered,
        receivedQuantity: received,
        remainingQuantity: remainingQty,
        error
      });
    }
  };

  const isFullyReceived = (item.orderedQuantity - item.receivedQuantity) <= 0;

  return (
    <tr>
      <td className="p-2 border text-center">{currentPage * pageSize + index + 1}</td>
      <td className="p-2 border">{item.materialCode || item.productCode}</td>
      <td className="p-2 border">{item.materialName || item.productName}</td>
      <td className="p-2 border text-center">{item.unit}</td>

      {isFullyReceived ? (
        <>
          <td className="p-2 border text-center text-gray-400" colSpan={2}>
            Đã nhập đủ
          </td>
          <td className="p-2 border text-center">{item.receivedQuantity}</td>
          <td className="p-2 border text-center">0</td>
        </>
      ) : (
        <>
          <td className="p-2 border">
            <Select
              value={warehouse}
              onChange={(value) => handleWarehouseChange(value)}
              className="!border-t-blue-gray-200 focus:!border-t-gray-900 min-w-[150px]"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            >
              {warehouses.map((warehouse) => (
                <Option key={warehouse.warehouseId} value={warehouse.warehouseCode}>
                  {warehouse.warehouseCode} - {warehouse.warehouseName}
                </Option>
              ))}
            </Select>
          </td>
          <td className="p-2 border text-center">{item.orderedQuantity}</td>
          <td className="p-2 border text-center">{item.receivedQuantity}</td>
          <td className="p-2 border text-center">{remainingQuantity}</td>
          <td className="p-2 border">
            <div>
              <Input
                type="text"
                inputMode="numeric"
                value={quantity}
                onChange={handleQuantityChange}
                className={`!border-t-blue-gray-200 focus:!border-t-gray-900 ${quantityError ? "border-red-500" : ""}`}
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              {quantityError && (
                <p className="text-red-500 text-xs mt-1">{quantityError}</p>
              )}
            </div>
          </td>
        </>
      )}
    </tr>
  );
};

export default ProductRow;
