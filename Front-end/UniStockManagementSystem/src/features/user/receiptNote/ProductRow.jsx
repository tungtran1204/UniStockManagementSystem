import React, { useState, useEffect } from "react";
import {
  Input,
} from "@material-tailwind/react";
import Select from "react-select";

const customStyles = {
  control: (provided, state) => ({
    ...provided,
    minWidth: 150,
    // Thiết lập viền duy nhất cho control:
    border: state.isFocused ? "1px solid black" : "1px solid #ccc",
    boxShadow: "none",
    "&:hover": {
      border: "1px solid black",
    },
  }),
  menuList: (provided) => ({
    ...provided,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "#f3f4f6"
      : state.isSelected
        ? "#e5e7eb"
        : "transparent",
    color: "#000",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#e5e7eb",
    },
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
};



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
  const [remainingQuantity, setRemainingQuantity] = useState(0);

  useEffect(() => {
    if (item.quantity !== undefined && item.quantity !== null) {
      setQuantity(item.quantity.toString());
    }
  }, [item.quantity]);


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
         <td className="px-4 py-2 text-sm border-r">
            <Select
              isSearchable
              options={warehouses.map(w => ({
                value: w.warehouseCode,
                label: `${w.warehouseCode} - ${w.warehouseName}`
              }))}
              styles={customStyles}
              menuPortalTarget={document.body}       // Render menu vào document.body
              menuPosition="fixed"                   // Sử dụng vị trí fixed để tránh bị cắt
              className="w-full px-2 py-1 rounded text-sm"
              value={
                warehouses.find(w => w.warehouseCode === warehouse)
                  ? {
                    value: warehouse,
                    label: `${warehouse} - ${warehouses.find(w => w.warehouseCode === warehouse)?.warehouseName}`
                  }
                  : null
              }
              onChange={(option) => handleWarehouseChange(option?.value || '')}
            />


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
                className={`!border-t-blue-gray-200 focus:!border-t-gray-900 ${quantityError ? "border-red-t-500" : ""}`}
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
