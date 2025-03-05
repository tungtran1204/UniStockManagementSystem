import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Select,
  Option,
  Typography,
} from "@material-tailwind/react";
import { checkProductCodeExists } from "../products/productService";
import { FaPlus, FaTimes } from "react-icons/fa";
import axios from 'axios';
import { checkMaterialCodeExists } from "../materials/materialService";

// Thêm hàm lấy token
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

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
  const [materials, setMaterials] = useState([]);
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [nextId, setNextId] = useState(1); // Thêm state cho ID tự tăng
  const [productMaterials, setProductMaterials] = useState([]);
  const [filteredMaterialsByField, setFilteredMaterialsByField] = useState({});
  const [showSuggestionsByField, setShowSuggestionsByField] = useState({});
  const [materialErrors, setMaterialErrors] = useState({}); // Thêm state để quản lý lỗi cho từng dòng
  const [billOfMaterialsError, setBillOfMaterialsError] = useState(""); // Thêm state cho lỗi định mức

  // useEffect phải đặt sau useState
  useEffect(() => {
    if (show) {
      fetchMaterials();
    }
  }, [show]);

  useEffect(() => {
    if (materialSearchQuery.trim() === "") {
      setFilteredMaterials([]);
      setShowSuggestions(false);
    } else {
      const filtered = materials.filter(material => 
        material.materialCode?.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
        material.materialName?.toLowerCase().includes(materialSearchQuery.toLowerCase())
      );
      setFilteredMaterials(filtered);
      setShowSuggestions(true);
    }
  }, [materialSearchQuery, materials]);

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

  // Sửa lại hàm fetchMaterials để thêm header xác thực
  const fetchMaterials = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/unistock/user/materials", { headers: authHeader() });
      if (response.data && Array.isArray(response.data.content)) {
        setMaterials(response.data.content);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nguyên vật liệu:", error);
    }
  };

  // Bỏ validation trong handleAddRow
  const handleAddRow = () => {
    setProductMaterials(prev => [...prev, {
      id: nextId,
      materialId: "",
      materialCode: "",
      materialName: "",
      unitName: "",
      quantity: 0
    }]);
    setNextId(prev => prev + 1);
  };

  // Xóa hết dòng
  const handleRemoveAllRows = () => {
    setProductMaterials([]);
    setNextId(1);
  };

  // Thêm hàm validate material
  const validateMaterial = async (value, index) => {
    try {
      const exists = await checkMaterialCodeExists(value);
      if (!exists) {
        setMaterialErrors(prev => ({
          ...prev,
          [index]: "Mã nguyên vật liệu không tồn tại!"
        }));
        return false;
      }

      // Kiểm tra trùng trong danh sách
      const isDuplicate = productMaterials.some(
        (item, idx) => idx !== index && 
        item.materialCode?.toLowerCase() === value?.toLowerCase()
      );

      if (isDuplicate) {
        setMaterialErrors(prev => ({
          ...prev,
          [index]: "Nguyên vật liệu này đã được thêm vào danh sách!"
        }));
        return false;
      }

      setMaterialErrors(prev => ({
        ...prev,
        [index]: ""
      }));
      return true;
    } catch (error) {
      console.error("Lỗi khi kiểm tra mã NVL:", error);
      return false;
    }
  };

  // Sửa lại hàm handleMaterialSearch để kiểm tra trùng
  const handleMaterialSearch = async (value, index, field) => {
    const updatedMaterials = [...productMaterials];
    updatedMaterials[index][field] = value;
    setProductMaterials(updatedMaterials);

    // Reset error khi người dùng nhập
    setMaterialErrors(prev => ({
      ...prev,
      [index]: ""
    }));

    if (value.trim()) {
      // Lấy danh sách mã vật tư đã được chọn
      const selectedCodes = productMaterials
        .filter((_, idx) => idx !== index) // Không tính dòng đang nhập
        .map(item => item.materialCode?.toLowerCase());

      // Lọc materials loại bỏ những vật tư đã được chọn
      const filtered = materials.filter(material => {
        const searchLower = value.toLowerCase();
        const isMatch = material.materialCode?.toLowerCase().includes(searchLower) ||
                       material.materialName?.toLowerCase().includes(searchLower);
        const isNotSelected = !selectedCodes.includes(material.materialCode?.toLowerCase());
        
        return isMatch && isNotSelected;
      });

      setFilteredMaterialsByField(prev => ({
        ...prev,
        [`${index}-${field}`]: filtered
      }));
      setShowSuggestionsByField(prev => ({
        ...prev,
        [`${index}-${field}`]: filtered.length > 0
      }));
    } else {
      setFilteredMaterialsByField(prev => ({
        ...prev,
        [`${index}-${field}`]: []
      }));
      setShowSuggestionsByField(prev => ({
        ...prev,
        [`${index}-${field}`]: false
      }));
    }
  };

  // Thêm hàm kiểm tra trùng mã NVL
  const handleSelectSuggestion = async (index, material) => {
    const isValid = await validateMaterial(material.materialCode, index);
    if (!isValid) return;

    const updatedMaterials = [...productMaterials];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      materialId: material.materialId,
      materialCode: material.materialCode,
      materialName: material.materialName,
      unitName: material.unitName
    };
    setProductMaterials(updatedMaterials);
    setShowSuggestionsByField(prev => ({
      ...prev,
      [`${index}-materialCode`]: false,
      [`${index}-materialName`]: false
    }));
  };

  // Sửa lại hàm handleCreateProduct để thêm validation định mức
  const handleCreateProduct = async () => {
    const newErrors = {};
    setBillOfMaterialsError(""); // Reset lỗi định mức
  
    if (isEmptyOrWhitespace(newProduct.productCode)) {
      newErrors.productCode = "Mã sản phẩm không được để trống hoặc chỉ chứa khoảng trắng!";
    }
    if (isEmptyOrWhitespace(newProduct.productName)) {
      newErrors.productName = "Tên sản phẩm không được để trống hoặc chỉ chứa khoảng trắng!";
    }

    // Kiểm tra định mức nguyên vật liệu
    const hasIncompleteRow = productMaterials.some(
      item => !item.materialCode || !item.materialName || !item.quantity || item.quantity <= 0
    );

    if (hasIncompleteRow) {
      setBillOfMaterialsError("Vui lòng điền đầy đủ thông tin cho tất cả các dòng nguyên vật liệu!");
      return;
    }
  
    setValidationErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0 && !productCodeError && !billOfMaterialsError) {
      const formData = new FormData();
      formData.append('productCode', newProduct.productCode);
      formData.append('productName', newProduct.productName);
      formData.append('description', newProduct.description || '');
      formData.append('unitId', newProduct.unitId || '');
      formData.append('typeId', newProduct.typeId || '');
      formData.append('isProductionActive', newProduct.isProductionActive || 'true');
      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }
      // Thêm định mức nguyên vật liệu
      formData.append('materials', JSON.stringify(productMaterials));
  
      try {
        await axios.post('http://localhost:8080/api/unistock/user/products/create', formData, {
          headers: {
            ...authHeader(),
            'Content-Type': 'multipart/form-data',
          },
        });
        onClose();
      } catch (error) {
        console.error("Lỗi khi tạo sản phẩm:", error);
      }
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
    <Dialog open={show} handler={onClose} size="xl" className="w-[900px] max-h-screen overflow-auto">
      <DialogHeader className="bg-gray-50">
        <Typography variant="h5" color="blue-gray" className="px-5">
          Tạo sản phẩm mới
        </Typography>
      </DialogHeader>

      <DialogBody divider className="flex flex-col gap-4 px-10 border-none">
        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <div className="flex flex-col gap-4">
            <div>
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                Mã sản phẩm *
              </Typography>
              <Input
                type="text"
                value={newProduct.productCode || ""}
                onChange={(e) => handleCheckProductCode(e.target.value)}
                className={`w-full ${errors.productCode || productCodeError || (validationErrors.productCode && !isFieldValid(newProduct.productCode)) ? 'border-red-500' : ''}`}
              />
              {(productCodeError || validationErrors.productCode || errors.productCode) && (
                <Typography className="text-xs text-red-500 mt-1">
                  {productCodeError || validationErrors.productCode || errors.productCode}
                </Typography>
              )}
            </div>

            <div>
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                Đơn vị
              </Typography>
              <Select
                value={newProduct.unitId?.toString() || ""}
                onChange={(value) => setNewProduct({ ...newProduct, unitId: value })}
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
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                Mô tả
              </Typography>
              <Input
                type="text"
                value={newProduct.description || ""}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                Tên sản phẩm *
              </Typography>
              <Input
                type="text"
                value={newProduct.productName || ""}
                onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                className={`w-full ${errors.productName || (validationErrors.productName && !isFieldValid(newProduct.productName)) ? 'border-red-500' : ''}`}
              />
              {(validationErrors.productName || errors.productName) && (
                <Typography className="text-xs text-red-500 mt-1">
                  {validationErrors.productName || errors.productName}
                </Typography>
              )}
            </div>

            <div>
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                Dòng sản phẩm
              </Typography>
              <Select
                value={newProduct.typeId?.toString() || ""}
                onChange={(value) => setNewProduct({ ...newProduct, typeId: value })}
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
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                Hình ảnh sản phẩm
              </Typography>
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
              />
              {newProduct.imageUrl && (
                <div className="mt-2 relative">
                  <img
                    src={newProduct.imageUrl}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thêm phần định mức nguyên vật liệu */}
        <div className="mt-8">
          <Typography variant="h6" color="blue-gray" className="mb-4">
            Định mức nguyên vật liệu
          </Typography>

          {/* Hiển thị lỗi định mức */}
          {billOfMaterialsError && (
            <Typography className="text-xs text-red-500 mb-2">
              {billOfMaterialsError}
            </Typography>
          )}

          <div className="mt-2 overflow-auto border-none rounded">
            <table className="w-full text-left min-w-max border border-gray-200">
              <thead className="bg-gray-50 border border-gray-200">
                <tr>
                  {["STT", "Mã NVL", "Tên NVL", "ĐVT", "Số lượng", ""].map(header => (
                    <th key={header} className="px-4 py-2 text-sm border border-gray-200 font-semibold text-gray-600">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productMaterials.length > 0 ? (
                  productMaterials.map((item, index) => (
                    <tr key={item.id} className="border border-gray-200">
                      <td className="px-4 py-2 text-sm">
                        {index + 1}
                      </td>
                      <td className="px-4 py-2 text-sm relative">
                        <Input
                          variant="standard"
                          value={item.materialCode}
                          onChange={(e) => handleMaterialSearch(e.target.value, index, 'materialCode')}
                          className={`w-28 ${materialErrors[index] ? 'border-red-500' : ''}`}
                          label="Nhập mã NVL" // Thêm label
                        />
                        {materialErrors[index] && (
                          <Typography className="text-xs text-red-500 mt-1 absolute">
                            {materialErrors[index]}
                          </Typography>
                        )}
                        {showSuggestionsByField[`${index}-materialCode`] && 
                        filteredMaterialsByField[`${index}-materialCode`]?.length > 0 && (
                          <ul className="absolute z-50 w-64 bg-white border border-gray-200 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                            {filteredMaterialsByField[`${index}-materialCode`].map((material) => (
                              <li
                                key={material.materialId}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => handleSelectSuggestion(index, material)}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{material.materialCode}</span>
                                  <span className="text-xs text-gray-600">{material.materialName}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm relative">
                        <Input
                          variant="standard"
                          value={item.materialName}
                          onChange={(e) => handleMaterialSearch(e.target.value, index, 'materialName')}
                          className="w-40"
                        />
                        {showSuggestionsByField[`${index}-materialName`] && 
                        filteredMaterialsByField[`${index}-materialName`]?.length > 0 && (
                          <ul className="absolute z-50 w-64 bg-white border border-gray-200 rounded-md mt-1 max-h-48 overflow-y-auto shadow-lg">
                            {filteredMaterialsByField[`${index}-materialName`].map((material) => (
                              <li
                                key={material.materialId}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                                onClick={() => handleSelectSuggestion(index, material)}
                              >
                                {material.materialCode} - {material.materialName}
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <Input
                          variant="standard"
                          value={item.unitName}
                          disabled
                          className="w-20"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <Input
                          variant="standard"
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const updatedMaterials = [...productMaterials];
                            updatedMaterials[index].quantity = Number(e.target.value);
                            setProductMaterials(updatedMaterials);
                          }}
                          min={1}
                          className="w-20"
                        />
                      </td>
                      <td className="px-4 py-2 text-sm text-center">
                        <Button
                          color="red"
                          variant="text"
                          size="sm"
                          onClick={() => {
                            setProductMaterials(prev => 
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
                      Chưa có dòng nào được thêm
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Di chuyển nút xuống dưới bảng */}
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outlined" onClick={handleAddRow}>
              + Thêm dòng
            </Button>
            <Button variant="outlined" color="red" onClick={handleRemoveAllRows}>
              Xóa hết dòng
            </Button>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-end gap-2">
        <Button variant="text" color="gray" onClick={onClose}>
          Hủy
        </Button>
        <Button
          variant="gradient"
          color="green"
          onClick={handleCreateProduct}
          disabled={isCreateDisabled()}
        >
          {loading ? "Đang xử lý..." : "Tạo sản phẩm"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default CreateProductModal;