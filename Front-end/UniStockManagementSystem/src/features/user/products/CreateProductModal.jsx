import React, { useState, useEffect } from "react";
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
import { FaPlus, FaTimes } from "react-icons/fa";
import axios from "axios";
import { checkProductCodeExists, createProduct, fetchUnits, fetchProductTypes } from "./productService";
import { checkMaterialCodeExists } from "../materials/materialService";

const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Thêm prop fetchProducts vào component
const CreateProductModal = ({ show, onClose, fetchProducts }) => {
  const [newProduct, setNewProduct] = useState({
    productCode: "",
    productName: "",
    description: "",
    unitId: "",
    productTypeId: "",
    isProductionActive: "true",
  });
  const [loading, setLoading] = useState(false);
  const [productCodeError, setProductCodeError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [materials, setMaterials] = useState([]);
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [nextId, setNextId] = useState(1);
  const [productMaterials, setProductMaterials] = useState([]);
  const [filteredMaterialsByField, setFilteredMaterialsByField] = useState({});
  const [showSuggestionsByField, setShowSuggestionsByField] = useState({});
  const [materialErrors, setMaterialErrors] = useState({});
  const [billOfMaterialsError, setBillOfMaterialsError] = useState("");
  const [tableSearchQuery, setTableSearchQuery] = useState("");
  const [units, setUnits] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [errors, setErrors] = useState({});

  // Fetch dữ liệu khi mở modal
  useEffect(() => {
    if (show) {
      fetchMaterials();
      loadInitialData();
    }
  }, [show]);

  const loadInitialData = async () => {
    try {
      const unitsData = await fetchUnits();
      const productTypesData = await fetchProductTypes();
      setUnits(unitsData);
      setProductTypes(productTypesData);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu ban đầu:", error);
      setErrors({ message: error.message });
    }
  };

  // Fetch danh sách nguyên vật liệu
  const fetchMaterials = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/unistock/user/materials", {
        headers: authHeader(),
      });
      if (response.data && Array.isArray(response.data.content)) {
        setMaterials(response.data.content);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nguyên vật liệu:", error);
      setErrors({ message: error.message });
    }
  };

  // Lọc danh sách gợi ý khi tìm kiếm nguyên vật liệu
  useEffect(() => {
    if (materialSearchQuery.trim() === "") {
      setFilteredMaterials([]);
      setShowSuggestions(false);
    } else {
      const filtered = materials.filter((material) =>
        material.materialCode?.toLowerCase().includes(materialSearchQuery.toLowerCase()) ||
        material.materialName?.toLowerCase().includes(materialSearchQuery.toLowerCase())
      );
      setFilteredMaterials(filtered);
      setShowSuggestions(true);
    }
  }, [materialSearchQuery, materials]);

  // Kiểm tra chuỗi có chứa toàn khoảng trắng hoặc trống không
  const isEmptyOrWhitespace = (str) => !str || /^\s*$/.test(str);

  // Kiểm tra mã sản phẩm
  const handleCheckProductCode = async (newCode) => {
    setNewProduct((prev) => ({ ...prev, productCode: newCode || "" }));
    setProductCodeError(""); // Reset lỗi mỗi khi nhập

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

  // Thêm dòng mới cho định mức
  const handleAddRow = () => {
    setProductMaterials((prev) => [
      ...prev,
      {
        id: nextId,
        materialId: "",
        materialCode: "",
        materialName: "",
        unitName: "",
        quantity: 0,
      },
    ]);
    setNextId((prev) => prev + 1);
  };

  // Xóa hết dòng
  const handleRemoveAllRows = () => {
    setProductMaterials([]);
    setNextId(1);
  };

  // Validate mã nguyên vật liệu
  const validateMaterial = async (value, index) => {
    try {
      const exists = await checkMaterialCodeExists(value);
      if (!exists) {
        setMaterialErrors((prev) => ({
          ...prev,
          [index]: "Mã nguyên vật liệu không tồn tại!",
        }));
        return false;
      }

      // Kiểm tra trùng trong danh sách
      const isDuplicate = productMaterials.some(
        (item, idx) => idx !== index && item.materialCode?.toLowerCase() === value?.toLowerCase()
      );

      if (isDuplicate) {
        setMaterialErrors((prev) => ({
          ...prev,
          [index]: "Nguyên vật liệu này đã được thêm vào danh sách!",
        }));
        return false;
      }

      setMaterialErrors((prev) => ({
        ...prev,
        [index]: "",
      }));
      return true;
    } catch (error) {
      console.error("Lỗi khi kiểm tra mã NVL:", error);
      return false;
    }
  };

  // Xử lý tìm kiếm nguyên vật liệu trong từng dòng
  const handleMaterialSearch = async (value, index, field) => {
    const updatedMaterials = [...productMaterials];
    updatedMaterials[index][field] = value;
    setProductMaterials(updatedMaterials);

    setMaterialErrors((prev) => ({
      ...prev,
      [index]: "",
    }));

    if (value.trim()) {
      const selectedCodes = productMaterials
        .filter((_, idx) => idx !== index)
        .map((item) => item.materialCode?.toLowerCase());

      const filtered = materials.filter((material) => {
        const searchLower = value.toLowerCase();
        const isMatch =
          material.materialCode?.toLowerCase().includes(searchLower) ||
          material.materialName?.toLowerCase().includes(searchLower);
        const isNotSelected = !selectedCodes.includes(material.materialCode?.toLowerCase());

        return isMatch && isNotSelected;
      });

      setFilteredMaterialsByField((prev) => ({
        ...prev,
        [`${index}-${field}`]: filtered,
      }));
      setShowSuggestionsByField((prev) => ({
        ...prev,
        [`${index}-${field}`]: filtered.length > 0,
      }));
    } else {
      setFilteredMaterialsByField((prev) => ({
        ...prev,
        [`${index}-${field}`]: [],
      }));
      setShowSuggestionsByField((prev) => ({
        ...prev,
        [`${index}-${field}`]: false,
      }));
    }
  };

  // Chọn gợi ý nguyên vật liệu
  const handleSelectSuggestion = async (index, material) => {
    const isValid = await validateMaterial(material.materialCode, index);
    if (!isValid) return;

    const updatedMaterials = [...productMaterials];
    updatedMaterials[index] = {
      ...updatedMaterials[index],
      materialId: material.materialId,
      materialCode: material.materialCode,
      materialName: material.materialName,
      unitName: material.unitName,
    };
    setProductMaterials(updatedMaterials);
    setShowSuggestionsByField((prev) => ({
      ...prev,
      [`${index}-materialCode`]: false,
      [`${index}-materialName`]: false,
    }));
  };

  const handleCreateProduct = async () => {
    const newErrors = {};
    setBillOfMaterialsError("");
  
    if (isEmptyOrWhitespace(newProduct.productCode)) {
      newErrors.productCode = "Mã sản phẩm không được để trống hoặc chỉ chứa khoảng trắng!";
    }
    if (isEmptyOrWhitespace(newProduct.productName)) {
      newErrors.productName = "Tên sản phẩm không được để trống hoặc chỉ chứa khoảng trắng!";
    }
  
    const hasIncompleteRow = productMaterials.some(
      (item) => !item.materialCode || !item.materialName || !item.quantity || item.quantity <= 0
    );
  
    if (hasIncompleteRow) {
      setBillOfMaterialsError("Vui lòng điền đầy đủ thông tin cho tất cả các dòng nguyên vật liệu!");
      return;
    }
  
    setValidationErrors(newErrors);
  
    if (Object.keys(newErrors).length === 0 && !productCodeError && !billOfMaterialsError) {
      const formData = new FormData();
      formData.append("productCode", newProduct.productCode.trim());
      formData.append("productName", newProduct.productName.trim());
      formData.append("description", newProduct.description?.trim() || "");
      formData.append("unitId", newProduct.unitId || "");
      formData.append("typeId", newProduct.productTypeId || "");
      formData.append("isProductionActive", newProduct.isProductionActive === "true" || true);
      if (newProduct.image) {
        formData.append("image", newProduct.image);
      }
  
      // Chuyển productMaterials thành chuỗi JSON và thêm vào formData
      const materialsData = productMaterials.map((item) => ({
        materialId: item.materialId,
        materialCode: item.materialCode,
        materialName: item.materialName,
        quantity: item.quantity,
      }));
      formData.append("materials", JSON.stringify(materialsData));
  
      try {
        setLoading(true);
        const headers = {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        };
  
        console.log("Request headers:", headers);
        console.log("Request data:", [...formData.entries()]);
  
        const response = await axios.post(
          "http://localhost:8080/api/unistock/user/products/create",
          formData,
          { headers }
        );
  
        console.log("Response:", response);
  
        if (response.data) {
          await fetchProducts();
          onClose();
        }
      } catch (error) {
        console.error("Error details:", {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          headers: error.response?.headers,
        });
  
        if (error.response?.status === 403) {
          setErrors({ message: "Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập bằng tài khoản có quyền phù hợp." });
        } else if (error.response?.status === 401) {
          setErrors({ message: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại." });
        } else {
          setErrors({ message: `Có lỗi xảy ra khi tạo sản phẩm: ${error.response?.data?.message || error.message}` });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  // Kiểm tra điều kiện để vô hiệu hóa nút "Tạo sản phẩm"
  const isCreateDisabled = () => {
    return loading || !!productCodeError;
  };

  // Kiểm tra liệu trường có dữ liệu hợp lệ không
  const isFieldValid = (value) => {
    return value && !isEmptyOrWhitespace(value);
  };

  // Lọc danh sách vật tư trong bảng
  const filteredTableMaterials = productMaterials.filter((item) => {
    if (!tableSearchQuery.trim()) return true;

    const searchLower = tableSearchQuery.toLowerCase();
    return (
      item.materialCode?.toLowerCase().includes(searchLower) ||
      item.materialName?.toLowerCase().includes(searchLower)
    );
  });

  if (!show) return null;

  return (
    <Dialog open={show} handler={onClose} size="xl" className="w-[900px] max-h-screen overflow-auto">
      <DialogHeader className="bg-gray-50">
        <Typography variant="h5" color="blue-gray" className="px-5">
          Tạo sản phẩm mới
        </Typography>
      </DialogHeader>

      <DialogBody divider className="flex flex-col gap-4 px-10 border-none">
        {errors.message && (
          <Typography className="text-red-500 mb-4">{errors.message}</Typography>
        )}

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
                className={`w-full ${errors.productCode || productCodeError || (validationErrors.productCode && !isFieldValid(newProduct.productCode)) ? "border-red-500" : ""}`}
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
                className={`w-full ${errors.productName || (validationErrors.productName && !isFieldValid(newProduct.productName)) ? "border-red-500" : ""}`}
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
                value={newProduct.productTypeId?.toString() || ""}
                onChange={(value) => setNewProduct({ ...newProduct, productTypeId: value })}
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
                    setNewProduct((prev) => ({
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

        {/* Phần định mức nguyên vật liệu */}
        <div className="mt-8">
          <Typography variant="h6" color="blue-gray" className="mb-4">
            Định mức nguyên vật liệu
          </Typography>

          {billOfMaterialsError && (
            <Typography className="text-xs text-red-500 mb-2">
              {billOfMaterialsError}
            </Typography>
          )}

          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Input
                label="Tìm kiếm nguyên vật liệu"
                value={tableSearchQuery}
                onChange={(e) => setTableSearchQuery(e.target.value)}
                icon={
                  tableSearchQuery && (
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      onClick={() => setTableSearchQuery("")}
                    >
                      <FaTimes className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </button>
                  )
                }
              />
            </div>
          </div>

          <div className="mt-2">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-50 border border-gray-200">
                <tr>
                  <th className="px-2 py-2 text-sm border border-gray-200 font-semibold text-gray-600 w-[60px]">STT</th>
                  <th className="px-2 py-2 text-sm border border-gray-200 font-semibold text-gray-600 w-[120px]">Mã NVL</th>
                  <th className="px-2 py-2 text-sm border border-gray-200 font-semibold text-gray-600 w-[200px]">Tên NVL</th>
                  <th className="px-2 py-2 text-sm border border-gray-200 font-semibold text-gray-600 w-[80px]">ĐVT</th>
                  <th className="px-2 py-2 text-sm border border-gray-200 font-semibold text-gray-600 w-[100px]">Số lượng</th>
                  <th className="px-2 py-2 text-sm border border-gray-200 font-semibold text-gray-600 w-[80px]"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTableMaterials.length > 0 ? (
                  filteredTableMaterials.map((item, index) => (
                    <tr key={item.id} className="border border-gray-200">
                      <td className="px-2 py-2 text-sm text-center">{index + 1}</td>
                      <td className="px-2 py-2 text-sm relative">
                        <Input
                          variant="standard"
                          value={item.materialCode}
                          onChange={(e) => handleMaterialSearch(e.target.value, index, "materialCode")}
                          className={`w-full ${materialErrors[index] ? "border-red-500" : ""}`}
                          label="Nhập mã NVL"
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
                      <td className="px-2 py-2 text-sm relative">
                        <Input
                          variant="standard"
                          value={item.materialName}
                          onChange={(e) => handleMaterialSearch(e.target.value, index, "materialName")}
                          className="w-full"
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
                      <td className="px-2 py-2 text-sm">
                        <Input
                          variant="standard"
                          value={item.unitName}
                          disabled
                          className="w-full"
                        />
                      </td>
                      <td className="px-2 py-2 text-sm">
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
                          className="w-full"
                        />
                      </td>
                      <td className="px-2 py-2 text-sm text-center">
                        <Button
                          color="red"
                          variant="text"
                          size="sm"
                          onClick={() => {
                            setProductMaterials((prev) => prev.filter((_, i) => i !== index));
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
                      {productMaterials.length === 0
                        ? "Chưa có dòng nào được thêm"
                        : "Không tìm thấy kết quả phù hợp"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-start gap-2 mt-4">
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
}

export default CreateProductModal;