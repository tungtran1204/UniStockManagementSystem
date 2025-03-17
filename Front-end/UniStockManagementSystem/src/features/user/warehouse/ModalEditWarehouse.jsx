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
    <Dialog open={true} handler={onClose} size="md" className="px-4 py-2">
      {/* Header của Dialog */}
      <DialogHeader className="flex justify-between items-center pb-2">
        <Typography variant="h4" color="blue-gray">
          Chỉnh sửa kho
        </Typography>
        <IconButton
          size="sm"
          variant="text"
          onClick={onClose}
        >
          <XMarkIcon className="h-5 w-5 stroke-2" />
        </IconButton>
      </DialogHeader>
      <Divider variant="middle" />
      {/* Body của Dialog */}
      <DialogBody className="space-y-4 pb-6 pt-6">

        {/* Mã kho & Tên kho */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Typography variant="medium" className="text-black">
              Mã kho
              <span className="text-red-500"> *</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              hiddenLabel
              placeholder="Mã kho"
              color="success"
              value={warehouseCode}
              onChange={(e) => {
                setWarehouseCode(e.target.value);
                validateFields("warehouseCode", e.target.value);
              }}
              error={!!error.warehouseName}
            />
            {error.warehouseCode && <Typography variant="small" color="red">{error.warehouseCode}</Typography>}
          </div>
          <div>
            <Typography variant="medium" className="text-black">
              Tên kho
              <span className="text-red-500"> *</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              hiddenLabel
              placeholder="Tên kho"
              color="success"
              value={warehouseName}
              onChange={(e) => {
                setWarehouseName(e.target.value);
                validateFields("warehouseName", e.target.value);
              }}
              error={!!error.warehouseName}
            />
            {error.warehouseName && <Typography variant="small" color="red">{error.warehouseName}</Typography>}
          </div>
        </div>

        {/* Mô tả */}
        <div>
          <Typography variant="medium" className="text-black">
            Mô tả
          </Typography>
          <TextField
            fullWidth
            size="small"
            hiddenLabel
            placeholder="Mô tả"
            variant="outlined"
            multiline
            rows={3}
            color="success"
            value={warehouseDescription}
            onChange={(e) => {
              setDescription(e.target.value);
              validateFields("warehouseDescription", e.target.value);
            }}
          />
          {error.warehouseDescription && <Typography variant="small" color="red">{error.warehouseDescription}</Typography>}
        </div>
      </DialogBody>

      {/* Footer của Dialog */}
      <DialogFooter className="pt-0">
        <MuiButton
          size="medium"
          color="error"
          variant="outlined"
          onClick={onClose}
        >
          Hủy
        </MuiButton>
        <Button
          size="lg"
          color="white"
          variant="text"
          className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 ml-3 rounded-[4px] transition-all duration-200 ease-in-out"
          ripple={true}
          onClick={handleUpdate}
        >
          Lưu
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalEditWarehouse;

