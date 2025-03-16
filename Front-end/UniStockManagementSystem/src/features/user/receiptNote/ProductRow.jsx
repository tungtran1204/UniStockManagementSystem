import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Option,
} from "@material-tailwind/react";

// Hàm kiểm tra số lượng nhập hợp lệ
const isValidQuantity = (inputQty, orderedQty) => {
  if (!inputQty || isNaN(inputQty)) return false;

  const numInputQty = parseFloat(inputQty);
  const numOrderedQty = parseFloat(orderedQty);
  const minAllowed = 1;
  const maxAllowed = numOrderedQty * 1.01; // +1%

  return numInputQty >= minAllowed && numInputQty <= maxAllowed;
};

const ProductRow = ({ item, index, warehouses, defaultWarehouseCode, currentPage, pageSize, onDataChange }) => {
  const [warehouse, setWarehouse] = useState(defaultWarehouseCode || '');
  const [quantity, setQuantity] = useState(item.orderedQuantity || '');
  const [quantityError, setQuantityError] = useState('');

  // Xử lý thay đổi kho
  const handleWarehouseChange = (value) => {
    setWarehouse(value);
    // Thông báo sự thay đổi lên component cha
    onDataChange(item.id, { warehouse: value, quantity, error: quantityError });
  };

  // Xử lý thay đổi số lượng
  const handleQuantityChange = (e) => {
    const value = e.target.value;
    setQuantity(value);
    
    // Validate số lượng
    let error = '';
    if (!isValidQuantity(value, item.orderedQuantity)) {
      error = "Số lượng nhập phải hợp lệ và không lớn hơn 1% so với số lượng đặt";
      setQuantityError(error);
    } else {
      setQuantityError('');
    }
    
    // Thông báo sự thay đổi lên component cha
    onDataChange(item.id, { warehouse, quantity: value, error });
  };

  // Cập nhật giá trị mặc định khi props thay đổi
  useEffect(() => {
    if (defaultWarehouseCode && !warehouse) {
      setWarehouse(defaultWarehouseCode);
      onDataChange(item.id, { warehouse: defaultWarehouseCode, quantity, error: quantityError });
    }
  }, [defaultWarehouseCode]);

  return (
    <tr>
      <td className="p-2 border text-center">{currentPage * pageSize + index + 1}</td>
      <td className="p-2 border">{item.materialCode}</td>
      <td className="p-2 border">{item.materialName}</td>
      <td className="p-2 border text-center">{item.unit}</td>
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
      <td className="p-2 border">
        <div>
          <Input
            type="number"
            step="0.01"
            value={quantity}
            onChange={handleQuantityChange}
            className={`!border-t-blue-gray-200 focus:!border-t-gray-900 ${
              quantityError ? "border-red-500" : ""
            }`}
            labelProps={{
              className: "before:content-none after:content-none",
            }}
          />
          {quantityError && (
            <p className="text-red-500 text-xs mt-1">{quantityError}</p>
          )}
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;