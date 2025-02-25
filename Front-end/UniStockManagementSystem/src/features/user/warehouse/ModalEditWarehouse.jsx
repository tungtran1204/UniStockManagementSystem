import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";
import useWarehouse from "./useWarehouse"; // Import useWarehouse hook

const ModalEditWarehouse = ({ open, onClose, warehouse, fetchWarehouses }) => {
  const [warehouseCode, setWarehouseCode] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseDescription, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { editWarehouse } = useWarehouse(); // Destructure updateWarehouse from useWarehouse

  useEffect(() => {
    if (warehouse) {
      setWarehouseCode(warehouse.warehouseCode);
      setWarehouseName(warehouse.warehouseName);
      setDescription(warehouse.warehouseDescription);
    }
  }, [warehouse]);

  const handleUpdate = async () => {
    setError("");
  
    // Validate mã kho
    if (!warehouseCode.trim()) {
      setError("Mã kho không được để trống.");
      return;
    }
    if (!/^[A-Za-z0-9_-]{1,10}$/.test(warehouseCode)) {
      setError("Mã kho chỉ được chứa chữ, số, dấu '-' hoặc '_', từ 1 đến 10 ký tự.");
      return;
    }
  
    // Validate tên kho
    if (!warehouseName.trim()) {
      setError("Tên kho không được để trống.");
      return;
    }
    if (!/^[A-Za-z0-9\s]{1,50}$/.test(warehouseName)) {
      setError("Tên kho chỉ được chứa chữ cái, số và khoảng trắng, tối đa 50 ký tự.");
      return;
    }
  
    // Validate mô tả kho
    if (warehouseDescription.length > 200) {
      setError("Mô tả không được vượt quá 200 ký tự.");
      return;
    }
  
    setLoading(true);
    try {
      await editWarehouse({
        warehouseCode,
        warehouseName,
        warehouseDescription,
      });
  
      alert("Thêm kho thành công!");
      onAdd?.();
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm kho:", error);
      alert("Lỗi khi thêm kho!");
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
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="mb-6 p-4 border border-gray-200 rounded-md">
          <Typography variant="small" className="mb-2 font-semibold">Thông tin kho</Typography>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <Input
                label="Mã kho*"
                value={warehouseCode}
                onChange={(e) => setWarehouseCode(e.target.value)}
                error={!!error && !warehouseCode}
              />
            </div>
            <div className="col-span-6">
              <Input
                label="Tên kho*"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                error={!!error && !warehouseName}
              />
            </div>
            <div className="col-span-12">
              <Textarea
                label="Mô tả"
                value={warehouseDescription}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <Typography variant="small" color="red" className="mt-2">
              {error}
            </Typography>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button color="gray" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button color="blue" onClick={handleUpdate} disabled={loading}>
            {loading ? "Đang xử lý..." : "Cập nhật"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditWarehouse;