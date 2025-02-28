import React, { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import axios from "axios"; // Thêm axios để gọi API

const CreateMaterialModal = ({
  show,
  onClose,
  loading,
  newMaterial,
  setNewMaterial,
  handleCreateMaterial,
  errors,
  setErrors,
  units = [],
  materialCategories = [],
}) => {
  const [checkingCode, setCheckingCode] = useState(false); // Trạng thái kiểm tra mã

  // Hàm kiểm tra mã nguyên vật liệu tồn tại
  const checkMaterialCodeExists = async (code) => {
    if (!code.trim()) return; // Không kiểm tra nếu mã trống

    setCheckingCode(true);
    try {
      const response = await axios.get(
        `http://localhost:8080/api/unistock/user/materials/check-material-code/${code}`
      );
      if (response.data.exists) {
        setErrors((prev) => ({ ...prev, materialCode: "Mã nguyên vật liệu đã tồn tại" }));
      } else {
        setErrors((prev) => ({ ...prev, materialCode: "" }));
      }
    } catch (error) {
      console.error("Lỗi kiểm tra mã nguyên vật liệu:", error);
    }
    setCheckingCode(false);
  };

  // Theo dõi sự thay đổi của mã nguyên vật liệu và kiểm tra sau 500ms
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      checkMaterialCodeExists(newMaterial.materialCode);
    }, 500); // Delay để tránh spam API

    return () => clearTimeout(delayDebounceFn);
  }, [newMaterial.materialCode]);

  if (!show) return null;

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
              onChange={(e) => setNewMaterial({ ...newMaterial, materialCode: e.target.value })}
              className={`w-full ${errors.materialCode ? "border-red-500" : ""}`}
            />
            {checkingCode && <Typography className="text-xs text-blue-500 mt-1">Đang kiểm tra...</Typography>}
            {errors.materialCode && (
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
              onChange={(e) => setNewMaterial({ ...newMaterial, materialName: e.target.value })}
              className={`w-full ${errors.materialName ? "border-red-500" : ""}`}
            />
            {errors.materialName && (
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
              className="w-full"
              label={newMaterial.unitId ? "" : "Chọn đơn vị"}
            >
              {units.map((unit) => (
                <Option key={unit.unitId} value={String(unit.unitId)}>
                  {unit.unitName}
                </Option>
              ))}
            </Select>
            {errors.unitId && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.unitId}
              </Typography>
            )}
          </div>

          {/* Danh mục */}
          <div>
            <Typography variant="small" className="mb-2">Danh mục *</Typography>
            <Select
              value={newMaterial.categoryId || ""}
              onChange={(value) => setNewMaterial({ ...newMaterial, categoryId: value })}
              className="w-full"
              label={newMaterial.categoryId ? "" : "Chọn danh mục"}
            >
              {materialCategories.map((category) => (
                <Option key={category.categoryId} value={String(category.categoryId)}>
                  {category.name}
                </Option>
              ))}
            </Select>
            {errors.categoryId && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.categoryId}
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

          {/* Ảnh nguyên vật liệu */}
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

        {/* Nút hành động */}
        <div className="flex justify-end gap-2">
          <Button color="gray" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button color="blue" onClick={handleCreateMaterial} disabled={loading || !!errors.materialCode}>
            {loading ? "Đang xử lý..." : "Tạo nguyên vật liệu"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateMaterialModal;
