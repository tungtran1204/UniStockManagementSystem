import React, { useState } from "react";
import {
  Typography,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";

const CreateProductTypeModal = ({ show, onClose, loading, onSuccess }) => {
  const [formData, setFormData] = useState({
    typeName: "",
    description: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  if (!show) return null;

  // Hàm kiểm tra chuỗi có chứa toàn khoảng trắng hoặc trống không
  const isEmptyOrWhitespace = (str) => !str || /^\s*$/.test(str);

  // Hàm xử lý khi thay đổi tên dòng sản phẩm
  const handleTypeNameChange = (newName) => {
    setFormData({ ...formData, typeName: newName });
    if (!isEmptyOrWhitespace(newName)) {
      setValidationErrors((prev) => ({ ...prev, typeName: "" }));
    }
  };

  // Hàm xử lý khi nhấn nút "Tạo dòng sản phẩm"
  const handleCreateProductType = async () => {
    const newErrors = {};

    if (isEmptyOrWhitespace(formData.typeName)) {
      newErrors.typeName = "Tên dòng sản phẩm không được để trống hoặc chỉ chứa khoảng trắng!";
    }

    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await onSuccess(formData);
        onClose();
      } catch (error) {
        console.error("Error creating product type:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Tạo dòng sản phẩm mới</Typography>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="grid gap-4 mb-4">
          {/* Tên dòng sản phẩm */}
          <div>
            <Typography variant="small" className="mb-2">Tên dòng sản phẩm *</Typography>
            <Input
              type="text"
              value={formData.typeName}
              onChange={(e) => handleTypeNameChange(e.target.value)}
              className={`w-full ${validationErrors.typeName ? "border-red-500" : ""}`}
            />
            {validationErrors.typeName && (
              <Typography className="text-xs text-red-500 mt-1">
                {validationErrors.typeName}
              </Typography>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <Typography variant="small" className="mb-2">Mô tả</Typography>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button color="gray" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button 
            color="blue" 
            onClick={handleCreateProductType} 
            disabled={loading || isEmptyOrWhitespace(formData.typeName)}
          >
            {loading ? "Đang xử lý..." : "Tạo dòng sản phẩm"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProductTypeModal;