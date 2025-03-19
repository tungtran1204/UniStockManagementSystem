import React, { useState, useEffect } from "react";
import {
  Input,
  Select,
  Option,
} from "@material-tailwind/react";

// Hàm kiểm tra số lượng nhập hợp lệ - đơn giản hóa chỉ cho phép số nguyên
const isValidQuantity = (inputQty, remainingQty) => {
  if (!inputQty || isNaN(inputQty)) return false;

  const numInputQty = parseInt(inputQty, 10);
  const numRemainingQty = parseInt(remainingQty, 10);
  const minAllowed = 1;
  const maxAllowed = Math.floor(numRemainingQty * 1.01); // +1% so với số lượng còn lại, làm tròn xuống

  return numInputQty >= minAllowed && numInputQty <= maxAllowed;
};

const ProductRow = ({ item, index, warehouses, defaultWarehouseCode, currentPage, pageSize, onDataChange }) => {
  const [warehouse, setWarehouse] = useState(defaultWarehouseCode || '');
  const [quantity, setQuantity] = useState(item.orderedQuantity || '');
  const [quantityError, setQuantityError] = useState('');
  const [remainingQuantity, setRemainingQuantity] = useState(item.remainingQuantity || '');

  // Cập nhật số lượng còn lại dựa trên số lượng nhập
  const updateRemainingQuantity = (inputQty) => {
    const numInputQty = parseInt(inputQty, 10) || 0;
    const numOrderedQty = parseInt(item.orderedQuantity, 10) || 0;
    
    // Tính toán số lượng còn lại: số lượng đặt - số lượng nhập
    const newRemainingQty = Math.max(0, numOrderedQty - numInputQty);
    
    setRemainingQuantity(newRemainingQty);
    return newRemainingQty.toString();
  };

  // Xử lý thay đổi kho
  const handleWarehouseChange = (value) => {
    setWarehouse(value);
    const warehouseObj = warehouses.find(w => w.warehouseCode === value);
    const warehouseId = warehouseObj ? warehouseObj.warehouseId : null;
    onDataChange(item.id, { warehouse: value, warehouseId, quantity, error: quantityError });
  };

  // Xử lý thay đổi số lượng - đơn giản hóa chỉ nhận số nguyên
  const handleQuantityChange = (e) => {
    const inputValue = e.target.value;
    
    // Chỉ cho phép chuỗi rỗng hoặc số nguyên dương
    if (inputValue === '' || /^\d+$/.test(inputValue)) {
      setQuantity(inputValue);
      
      let error = '';
      if (inputValue === '') {
        error = 'Số lượng nhập không được để trống';
      } else if (!isValidQuantity(inputValue, item.remainingQuantity)) {
        error = "Số lượng phải hợp lệ và không hơn 1% lượng cần nhập";
      }
      
      setQuantityError(error);
      
      // Cập nhật số lượng còn lại mới
      const newRemainingQty = inputValue ? updateRemainingQuantity(inputValue) : remainingQuantity;
      
      // Thông báo sự thay đổi lên component cha
      onDataChange(item.id, { 
        warehouse, 
        quantity: inputValue, 
        remainingQuantity: newRemainingQty, 
        error 
      });
    }
  };

  // Cập nhật giá trị mặc định khi props thay đổi
  useEffect(() => {
    if (defaultWarehouseCode && !warehouse) {
      setWarehouse(defaultWarehouseCode);
      onDataChange(item.id, { warehouse: defaultWarehouseCode, quantity, error: quantityError });
    }
  }, [defaultWarehouseCode]);

  useEffect(() => {
    // Nếu đã có số lượng nhập, cập nhật số lượng còn lại
    if (quantity) {
      updateRemainingQuantity(quantity);
    }
  }, []);

  return (
    <tr>
      <td className="p-2 border text-center">{currentPage * pageSize + index + 1}</td>
      <td className="p-2 border">{item.materialCode}</td>
      <td className="p-2 border">{item.materialName}</td>
      <td className="p-2 border text-center">{item.unit.unitName}</td>
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
      <td className="p-2 border text-center">{remainingQuantity}</td>
      <td className="p-2 border">
        <div>
          <Input
            type="text"
            inputMode="numeric"
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