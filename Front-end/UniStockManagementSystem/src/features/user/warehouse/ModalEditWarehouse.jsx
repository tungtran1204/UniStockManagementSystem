import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";
import useWarehouse from "./useWarehouse";

const ModalEditWarehouse = ({ open, onClose, warehouse, fetchWarehouses }) => {
  const [warehouseCode, setWarehouseCode] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseDescription, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({});

  const { editWarehouse } = useWarehouse();

  useEffect(() => {
    if (warehouse) {
      setWarehouseCode(warehouse.warehouseCode || "");
      setWarehouseName(warehouse.warehouseName || "");
      setDescription(warehouse.warehouseDescription || "");
    }
  }, [warehouse]);

  const validateFields = (field, value) => {
    let errors = { ...error };
    
    if (field === "warehouseCode") {
      if (!value.trim()) {
        errors.warehouseCode = "Mã kho không được để trống.";
      } else if (!/^[A-Za-z0-9_-]{1,10}$/.test(value)) {
        errors.warehouseCode = "Mã kho chỉ được chứa chữ, số, dấu '-' hoặc '_', từ 1 đến 10 ký tự.";
      } else {
        delete errors.warehouseCode;
      }
    }

    if (field === "warehouseName") {
      if (!value.trim()) {
        errors.warehouseName = "Tên kho không được để trống.";
      } else if (value.length > 100) {
        errors.warehouseName = "Tên kho không được vượt quá 100 ký tự.";
      } else {
        delete errors.warehouseName;
      }
    }

    if (field === "warehouseDescription") {
      if (value.length > 200) {
        errors.warehouseDescription = "Mô tả không được vượt quá 200 ký tự.";
      } else {
        delete errors.warehouseDescription;
      }
    }
    
    setError(errors);
  };

  const handleUpdate = async () => {
    if (Object.keys(error).length > 0) return;
    
    setLoading(true);
    try {
      await editWarehouse(warehouse.warehouseId, { warehouseCode, warehouseName, warehouseDescription });
      alert("Chỉnh sửa thông tin kho thành công!");
      fetchWarehouses();
      onClose();
    } catch (error) {
      console.error("Lỗi khi sửa thông tin kho:", error);
      alert("Lỗi khi sửa kho!");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Chỉnh sửa kho</Typography>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <Input
              label="Mã kho*"
              value={warehouseCode}
              onChange={(e) => {
                setWarehouseCode(e.target.value);
                validateFields("warehouseCode", e.target.value);
              }}
              error={!!error.warehouseCode}
            />
            {error.warehouseCode && <Typography variant="small" color="red">{error.warehouseCode}</Typography>}
          </div>
          <div className="col-span-6">
            <Input
              label="Tên kho*"
              value={warehouseName}
              onChange={(e) => {
                setWarehouseName(e.target.value);
                validateFields("warehouseName", e.target.value);
              }}
              error={!!error.warehouseName}
            />
            {error.warehouseName && <Typography variant="small" color="red">{error.warehouseName}</Typography>}
          </div>
          <div className="col-span-12">
            <Textarea
              label="Mô tả"
              value={warehouseDescription}
              onChange={(e) => {
                setDescription(e.target.value);
                validateFields("warehouseDescription", e.target.value);
              }}
            />
            {error.warehouseDescription && <Typography variant="small" color="red">{error.warehouseDescription}</Typography>}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button color="gray" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button color="blue" onClick={handleUpdate} disabled={loading || Object.keys(error).length > 0}>
            {loading ? "Đang xử lý..." : "Cập nhật"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditWarehouse;
