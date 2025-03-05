import React, { useState } from "react";
import {
  Typography,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { checkMaterialCodeExists } from "../materials/materialService";

const CreateMaterialModal = ({
  show,
  onClose,
  loading,
  newMaterial = {  // Thêm giá trị mặc định
    materialCode: '',
    materialName: '',
    description: '',
    unitId: '',
    typeId: '',
    isActive: 'true'
  },
  setNewMaterial,
  handleCreateMaterial,
  errors = {},  // Thêm giá trị mặc định cho errors
  units = [],
  materialCategories = [],
}) => {
  const [productCodeError, setProductCodeError] = useState(""); // State để lưu lỗi mã nguyên vật liệu tồn tại
  const [validationErrors, setValidationErrors] = useState({}); // State để lưu lỗi validation (khoảng trắng/trống)

  if (!show) return null;

  // Hàm kiểm tra chuỗi có chứa toàn khoảng trắng hoặc trống không
  const isEmptyOrWhitespace = (str) => !str || /^\s*$/.test(str);

  // Hàm kiểm tra mã nguyên vật liệu (kiểm tra ngay khi nhập)
  const handleCheckMaterialCode = async (newCode) => {
    setNewMaterial(prev => ({
      ...prev,
      materialCode: newCode || ''
    })); setProductCodeError(""); // Reset lỗi mỗi khi nhập
    if (newCode.trim()) {
      try {
        const exists = await checkMaterialCodeExists(newCode); // Gọi API kiểm tra
        if (exists) {
          setProductCodeError("Mã nguyên vật liệu này đã tồn tại!");
        }
      } catch (error) {
        console.error("❌ Lỗi kiểm tra mã nguyên vật liệu:", error);
        setProductCodeError("Lỗi khi kiểm tra mã nguyên vật liệu!");
      }
    }

    // Xóa lỗi validation nếu dữ liệu hợp lệ
    if (!isEmptyOrWhitespace(newCode)) {
      setValidationErrors((prev) => ({ ...prev, materialCode: "" }));
    }
  };

  // Hàm xử lý khi thay đổi tên nguyên vật liệu
  const handleMaterialNameChange = (newName) => {
    setNewMaterial({ ...newMaterial, materialName: newName });

    // Xóa lỗi validation nếu dữ liệu hợp lệ
    if (!isEmptyOrWhitespace(newName)) {
      setValidationErrors((prev) => ({ ...prev, materialName: "" }));
    }
  };

  // Hàm xử lý khi nhấn nút "Tạo nguyên vật liệu"
  const handleCreateMaterialWrapper = () => {
    const newErrors = {};

    if (isEmptyOrWhitespace(newMaterial.materialCode)) {
      newErrors.materialCode = "Mã nguyên vật liệu không được để trống hoặc chỉ chứa khoảng trắng!";
    }
    if (isEmptyOrWhitespace(newMaterial.materialName)) {
      newErrors.materialName = "Tên nguyên vật liệu không được để trống hoặc chỉ chứa khoảng trắng!";
    }
    if (!newMaterial.unitId) {
      newErrors.unitId = "Vui lòng chọn đơn vị!";
    }
    if (!newMaterial.typeId) {
      newErrors.typeId = "Vui lòng chọn danh mục!";
    }

    setValidationErrors(newErrors);

    console.log("📌 Dữ liệu newMaterial trước khi tạo:", newMaterial);

    // Chỉ gọi hàm gốc nếu không có lỗi validation và không có productCodeError
    if (Object.keys(newErrors).length === 0 && !productCodeError) {
      handleCreateMaterial();
    }
  };

  // Kiểm tra điều kiện để vô hiệu hóa nút "Tạo nguyên vật liệu"
  const isCreateDisabled = () => {
    return loading || !!productCodeError;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Tạo nguyên vật liệu mới</Typography>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Mã nguyên vật liệu */}
          <div>
            <Typography variant="small" className="mb-2">Mã nguyên vật liệu *</Typography>
            <Input
              type="text"
              value={newMaterial.materialCode || ""}
              onChange={(e) => handleCheckMaterialCode(e.target.value)}
              className={`w-full ${errors.materialCode || productCodeError || validationErrors.materialCode ? "border-red-500" : ""}`}
            />
            {productCodeError && (
              <Typography className="text-xs text-red-500 mt-1">
                {productCodeError}
              </Typography>
            )}
            {validationErrors.materialCode && (
              <Typography className="text-xs text-red-500 mt-1">
                {validationErrors.materialCode}
              </Typography>
            )}
            {errors.materialCode && !productCodeError && !validationErrors.materialCode && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.materialCode}
              </Typography>
            )}
          </div>

          {/* Tên nguyên vật liệu */}
          <div>
            <Typography variant="small" className="mb-2">Tên nguyên vật liệu *</Typography>
            <Input
              type="text"
              value={newMaterial.materialName || ""}
              onChange={(e) => handleMaterialNameChange(e.target.value)}
              className={`w-full ${errors.materialName || validationErrors.materialName ? "border-red-500" : ""}`}
            />
            {validationErrors.materialName && (
              <Typography className="text-xs text-red-500 mt-1">
                {validationErrors.materialName}
              </Typography>
            )}
            {errors.materialName && !validationErrors.materialName && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.materialName}
              </Typography>
            )}
          </div>

          {/* Đơn vị */}
          <div>
            <Typography variant="small" className="mb-2">Đơn vị *</Typography>
            <Select
              value={newMaterial.unitId || ""}
              onChange={(value) => setNewMaterial({ ...newMaterial, unitId: value })}
              className={`w-full ${errors.unitId || (validationErrors.unitId && !newMaterial.unitId) ? "border-red-500" : ""}`}
              label={newMaterial.unitId ? "" : "Chọn đơn vị"}
            >
              {units.length > 0 ? (
                units.map((unit) => (
                  <Option key={unit.unitId} value={String(unit.unitId)}>
                    {unit.unitName}
                  </Option>
                ))
              ) : (
                <Option disabled>Không có đơn vị nào</Option>
              )}
            </Select>
            {validationErrors.unitId && (
              <Typography className="text-xs text-red-500 mt-1">
                {validationErrors.unitId}
              </Typography>
            )}
            {errors.unitId && !validationErrors.unitId && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.unitId}
              </Typography>
            )}
          </div>

          {/* Danh mục */}
          <div>
            <Typography variant="small" className="mb-2">Danh mục *</Typography>
            <Select
              value={newMaterial.typeId || ""}
              onChange={(value) => setNewMaterial({ ...newMaterial, typeId: value })}
              className={`w-full ${errors.typeId || (validationErrors.typeId && !newMaterial.typeId) ? "border-red-500" : ""}`}
              label={newMaterial.typeId ? "" : "Chọn danh mục"}
            >
              {materialCategories.length > 0 ? (
                materialCategories.map((category) => (
                  <Option key={category.materialTypeId} value={String(category.materialTypeId)}>
                    {category.name}
                  </Option>
                ))
              ) : (
                <Option disabled>Không có danh mục nào</Option>
              )}
            </Select>
            {validationErrors.typeId && (
              <Typography className="text-xs text-red-500 mt-1">
                {validationErrors.typeId}
              </Typography>
            )}
            {errors.typeId && !validationErrors.typeId && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.typeId}
              </Typography>
            )}
          </div>

          {/* Mô tả */}
          <div className="col-span-2">
            <Typography variant="small" className="mb-2">Mô tả</Typography>
            <Input
              type="text"
              value={newMaterial.description || ""}
              onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
              className={`w-full ${errors.description ? "border-red-500" : ""}`}
            />
            {errors.description && (
              <Typography className="text-xs text-red-500 mt-1">{errors.description}</Typography>
            )}
          </div>

          {/* Hình ảnh nguyên vật liệu */}
          <div className="col-span-2">
            <Typography variant="small" className="mb-2">Hình ảnh nguyên vật liệu</Typography>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    alert("Kích thước file không được vượt quá 5MB");
                    e.target.value = "";
                    return;
                  }
                  const imageUrl = URL.createObjectURL(file);
                  setNewMaterial((prev) => ({
                    ...prev,
                    image: file,
                    imageUrl: imageUrl,
                  }));
                }
              }}
              className="w-full"
            />

            {newMaterial.imageUrl && (
              <div className="mt-2 relative">
                <img
                  src={newMaterial.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button color="gray" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button color="blue" onClick={handleCreateMaterialWrapper} disabled={isCreateDisabled()}>
            {loading ? "Đang xử lý..." : "Tạo nguyên vật liệu"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateMaterialModal;