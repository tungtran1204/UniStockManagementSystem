import React from 'react';
import {
    Typography,
    Button,
    Input,
    Select,
    Option,
} from "@material-tailwind/react";

const CreateProductModal = ({ 
  show, 
  onClose, 
  loading, 
  newProduct, 
  setNewProduct, 
  handleCreateProduct, 
  errors,
  units,
  productTypes 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Tạo sản phẩm mới</Typography>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Typography variant="small" className="mb-2">Mã sản phẩm *</Typography>
            <Input
              type="text"
              value={newProduct.productCode}
              onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
              className={`w-full ${errors.productCode ? 'border-red-500' : ''}`}
            />
            {errors.productCode && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.productCode}
              </Typography>
            )}
          </div>
          <div>
            <Typography variant="small" className="mb-2">Tên sản phẩm *</Typography>
            <Input
              type="text"
              value={newProduct.productName}
              onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
              className={`w-full ${errors.productName ? 'border-red-500' : ''}`}
            />
            {errors.productName && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.productName}
              </Typography>
            )}
          </div>
          <div>
            <Typography variant="small" className="mb-2">Đơn vị</Typography>
            <Select
              value={newProduct.unitId?.toString() || ""}
              onChange={(value) => setNewProduct({ ...newProduct, unitId: value })}
              className={`w-full ${errors.unitId ? 'border-red-500' : ''}`}
              label="Chọn đơn vị"
            >
              {units.map((unit) => (
                <Option key={unit.unitId} value={unit.unitId.toString()}>
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
          <div>
            <Typography variant="small" className="mb-2">Dòng sản phẩm</Typography>
            <Select
              value={newProduct.typeId?.toString() || ""}
              onChange={(value) => setNewProduct({ ...newProduct, typeId: value })}
              className={`w-full ${errors.typeId ? 'border-red-500' : ''}`}
              label="Chọn dòng sản phẩm"
            >
              {productTypes.map((type) => (
                <Option key={type.typeId} value={type.typeId.toString()}>
                  {type.typeName}
                </Option>
              ))}
            </Select>
            {errors.typeId && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.typeId}
              </Typography>
            )}
          </div>
          <div>
            <Typography variant="small" className="mb-2">Giá *</Typography>
            <Input
              type="number"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              className={`w-full ${errors.price ? 'border-red-500' : ''}`}
            />
            {errors.price && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.price}
              </Typography>
            )}
          </div>
          <div className="col-span-2">
            <Typography variant="small" className="mb-2">Mô tả</Typography>
            <Input
              type="text"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              className={`w-full ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.description}
              </Typography>
            )}
          </div>
          <div className="col-span-2">
            <Typography variant="small" className="mb-2">Hình ảnh sản phẩm</Typography>
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
                  setNewProduct(prev => ({
                    ...prev,
                    image: file,
                  }));
                }
              }}
              className="w-full"
            />
            {newProduct.imageUrl && (
              <div className="mt-2 relative">
                <img
                  src={newProduct.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => setNewProduct(prev => ({ ...prev, imageUrl: null, image: null }))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            color="gray"
            onClick={onClose}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            color="blue"
            onClick={handleCreateProduct}
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Tạo sản phẩm"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;