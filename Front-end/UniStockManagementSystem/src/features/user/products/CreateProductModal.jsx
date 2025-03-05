import React, { useState } from 'react';
import {
  Typography,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { checkProductCodeExists } from "../products/productService";

const CreateProductModal = ({
  show,
  onClose,
  loading,
  newProduct = {  // Thêm giá trị mặc định
    productCode: '',
    productName: '',
    description: '',
    unitId: '',
    typeId: '',
    isProductionActive: 'true'
  },
  setNewProduct,
  handleCreateProduct: originalHandleCreateProduct,
  errors = {},  // Thêm giá trị mặc định cho errors
  units,
  productTypes
}) => {
  const [productCodeError, setProductCodeError] = useState("");
  const [validationErrors, setValidationErrors] = useState({}); // State để lưu lỗi validation

  if (!show) return null;

  // Hàm kiểm tra chuỗi có chứa toàn khoảng trắng hoặc trống không
  const isEmptyOrWhitespace = (str) => !str || /^\s*$/.test(str);

  // Hàm kiểm tra mã sản phẩm (kiểm tra ngay khi nhập)
  const handleCheckProductCode = async (newCode) => {
    setNewProduct(prev => ({ 
      ...prev, 
      productCode: newCode || '' 
    }));    setProductCodeError(""); // Reset lỗi mỗi khi nhập

    if (newCode.trim()) {
      try {
        const exists = await checkProductCodeExists(newCode);
        if (exists) {
          setProductCodeError("Mã sản phẩm này đã tồn tại!");
        }
      } catch (error) {
        console.error("❌ Lỗi kiểm tra mã sản phẩm:", error);
        setProductCodeError("Lỗi khi kiểm tra mã sản phẩm!");
      }
    }
  };

  // Hàm xử lý khi nhấn nút "Tạo sản phẩm"
  const handleCreateProduct = () => {
    const newErrors = {};

    if (isEmptyOrWhitespace(newProduct.productCode)) {
      newErrors.productCode = "Mã sản phẩm không được để trống hoặc chỉ chứa khoảng trắng!";
    }
    if (isEmptyOrWhitespace(newProduct.productName)) {
      newErrors.productName = "Tên sản phẩm không được để trống hoặc chỉ chứa khoảng trắng!";
    }

    setValidationErrors(newErrors);

    // Chỉ gọi hàm gốc nếu không có lỗi validation và không có productCodeError
    if (Object.keys(newErrors).length === 0 && !productCodeError) {
      originalHandleCreateProduct();
    }
  };

  // Kiểm tra điều kiện để vô hiệu hóa nút "Tạo sản phẩm"
  const isCreateDisabled = () => {
    return loading || !!productCodeError;
  };

  // Kiểm tra liệu trường có dữ liệu hợp lệ không (không trống và không chỉ chứa khoảng trắng)
  const isFieldValid = (value) => {
    return value && !isEmptyOrWhitespace(value);
  };

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
              value={newProduct.productCode || ""}
              onChange={(e) => handleCheckProductCode(e.target.value)}
              className={`w-full ${errors.productCode || productCodeError || (validationErrors.productCode && !isFieldValid(newProduct.productCode)) ? 'border-red-500' : ''}`}
            />
            {productCodeError && (
              <Typography className="text-xs text-red-500 mt-1">
                {productCodeError}
              </Typography>
            )}
            {validationErrors.productCode && !isFieldValid(newProduct.productCode) && (
              <Typography className="text-xs text-red-500 mt-1">
                {validationErrors.productCode}
              </Typography>
            )}
            {errors.productCode && !productCodeError && (!validationErrors.productCode || isFieldValid(newProduct.productCode)) && (
              <Typography className="text-xs text-red-500 mt-1">
                {errors.productCode}
              </Typography>
            )}
          </div>
          <div>
            <Typography variant="small" className="mb-2">Tên sản phẩm *</Typography>
            <Input
              type="text"
              value={newProduct.productName || ""}
              onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
              className={`w-full ${errors.productName || (validationErrors.productName && !isFieldValid(newProduct.productName)) ? 'border-red-500' : ''}`}
            />
            {validationErrors.productName && !isFieldValid(newProduct.productName) && (
              <Typography className="text-xs text-red-500 mt-1">
                {validationErrors.productName}
              </Typography>
            )}
            {errors.productName && !validationErrors.productName && (
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
          <div className="col-span-2">
            <Typography variant="small" className="mb-2">Mô tả</Typography>
            <Input
              type="text"
              value={newProduct.description || ""}
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
            disabled={isCreateDisabled()}
          >
            {loading ? "Đang xử lý..." : "Tạo sản phẩm"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;