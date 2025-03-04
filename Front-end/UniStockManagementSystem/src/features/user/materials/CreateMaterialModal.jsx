import React from "react";
import {
  Typography,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";

const CreateMaterialModal = ({
  show,
  onClose,
  loading,
  newMaterial,
  setNewMaterial,
  handleCreateMaterial,
  errors,
  units = [],
  materialCategories = [],
}) => {
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
              value={newMaterial.typeId || ""}
              onChange={(value) => {
                console.log("Selected typeId:", value);
                setNewMaterial({ ...newMaterial, typeId: value });
              }}
              className="w-full"
              label={newMaterial.typeId ? "" : "Chọn danh mục"}
            >
              {materialCategories.length > 0 ? (
                materialCategories.map((category) => (
                  <Option key={category.typeId} value={String(category.typeId)}>
                    {category.name}
                  </Option>
                ))
              ) : (
                <Option disabled>Không có danh mục nào</Option>
              )}
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
                  // ✅ Tạo URL để hiển thị ảnh xem trước
                  const imageUrl = URL.createObjectURL(file);
                  setNewMaterial((prev) => ({
                    ...prev,
                    image: file,
                    imageUrl: imageUrl, // Lưu URL của ảnh để hiển thị
                  }));
                }
              }}
              className="w-full"
            />

            {/* ✅ Hiển thị ảnh xem trước */}
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
          <Button color="blue" onClick={handleCreateMaterial} disabled={loading}>
            {loading ? "Đang xử lý..." : "Tạo nguyên vật liệu"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateMaterialModal;