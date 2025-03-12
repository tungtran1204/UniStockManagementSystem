import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Typography,
} from "@material-tailwind/react";
import { FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { checkProductCodeExists, createProduct, fetchUnits, fetchProductTypes } from "./productService";
import { checkMaterialCodeExists } from "../materials/materialService";
import Select from "react-select";
import axios from "axios";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import ReactPaginate from "react-paginate";
import PageHeader from '@/components/PageHeader';

const customStyles = {
    control: (provided, state) => ({
        ...provided,
        minWidth: 200,
        borderColor: state.isFocused ? "black" : provided.borderColor,
        boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
        "&:hover": {
            borderColor: "black",
        },
    }),
    menuList: (provided) => ({
        ...provided,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused
            ? "#f3f4f6"
            : state.isSelected
                ? "#e5e7eb"
                : "transparent",
        color: "#000",
        cursor: "pointer",
        "&:active": {
            backgroundColor: "#e5e7eb",
        },
    }),
};

const authHeader = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("No token found");
        return null;
    }
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

const AddProductPage = () => {
    const navigate = useNavigate();

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
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [previewImage, setPreviewImage] = useState(null); // Thêm state cho preview
    const [quantityErrors, setQuantityErrors] = useState({}); // Thêm state cho lỗi số lượng

    useEffect(() => {
        fetchMaterials();
        loadInitialData();
    }, []);

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

    const fetchMaterials = async () => {
        try {
            const headers = authHeader();
            if (!headers) {
                throw new Error("No authentication token");
            }

            const response = await axios.get(
                "http://localhost:8080/api/unistock/user/materials",
                {
                    headers,
                    withCredentials: true,
                }
            );
            if (response.data && Array.isArray(response.data.content)) {
                setMaterials(response.data.content);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách nguyên vật liệu:", error);
            setErrors({ message: error.message });
        }
    };

    const isEmptyOrWhitespace = (str) => !str || /^\s*$/.test(str);

    const handleCheckProductCode = async (newCode) => {
        // Reset cả 2 loại lỗi khi người dùng nhập
        setProductCodeError("");
        setValidationErrors(prev => ({
            ...prev,
            productCode: ""
        }));

        // Cập nhật giá trị
        setNewProduct((prev) => ({
            ...prev,
            productCode: newCode || ""
        }));

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

    const handleAddRow = () => {
        setProductMaterials((prev) => [
            ...prev,
            {
                id: nextId,
                materialId: "",
                materialCode: "",
                materialName: "",
                unitName: "",
                quantity: 1,
            },
        ]);
        setNextId((prev) => prev + 1);
        setBillOfMaterialsError(""); // Reset thông báo lỗi khi thêm dòng mới
    };

    const handleRemoveAllRows = () => {
        setProductMaterials([]);
        setNextId(1);
        setCurrentPage(0);
    };

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
    };

    useEffect(() => {
        // Chỉ kiểm tra các dòng đã được chọn vật tư
        const materialsToValidate = productMaterials.filter(item => item.materialId);

        if (materialsToValidate.length === 0) {
            setBillOfMaterialsError(""); // Không hiện lỗi nếu chưa có dòng nào được chọn
            return;
        }

        const hasIncompleteRow = materialsToValidate.some(
            (item) => !item.quantity || item.quantity <= 0
        );

        if (hasIncompleteRow) {
            setBillOfMaterialsError("Vui lòng điền đầy đủ số lượng cho các dòng đã chọn!");
        } else {
            setBillOfMaterialsError("");
        }
    }, [productMaterials]);

    const handleCreateProduct = async () => {
        const newErrors = {};

        if (isEmptyOrWhitespace(newProduct.productCode)) {
            newErrors.productCode = "Mã sản phẩm không được để trống hoặc chỉ chứa khoảng trắng!";
        }
        if (isEmptyOrWhitespace(newProduct.productName)) {
            newErrors.productName = "Tên sản phẩm không được để trống hoặc chỉ chứa khoảng trắng!";
        }
        if (!newProduct.unitId) {
            newErrors.unitId = "Đơn vị không được bỏ trống!";
        }
        if (!newProduct.productTypeId) {
            newErrors.productTypeId = "Dòng sản phẩm không được bỏ trống!";
        }

        setValidationErrors(newErrors);

        // Kiểm tra toàn bộ form trước khi submit
        const hasEmptyRows = productMaterials.some(
            (item) => !item.materialId || !item.materialCode || !item.materialName || !item.quantity || item.quantity <= 0
        );

        if (hasEmptyRows) {
            setBillOfMaterialsError("Vui lòng điền đầy đủ thông tin cho tất cả các dòng nguyên vật liệu!");
            return;
        }

        if (
            Object.keys(newErrors).length === 0 &&
            !productCodeError &&
            !billOfMaterialsError // Vẫn giữ check billOfMaterialsError
        ) {
            try {
                setLoading(true);

                const headers = authHeader();
                if (!headers) {
                    setErrors({ message: "Vui lòng đăng nhập lại để thực hiện thao tác này" });
                    return;
                }

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

                const materialsData = productMaterials.map((item) => ({
                    materialId: item.materialId,
                    materialCode: item.materialCode,
                    materialName: item.materialName,
                    quantity: item.quantity,
                }));
                formData.append("materials", JSON.stringify(materialsData));

                const response = await axios.post(
                    "http://localhost:8080/api/unistock/user/products/create",
                    formData,
                    {
                        headers: {
                            Authorization: headers.Authorization,
                        },
                        withCredentials: true,
                    }
                );

                if (response.data) {
                    alert("Tạo sản phẩm thành công!");
                    navigate("/user/products");
                }
            } catch (error) {
                console.error("Create product error:", error);
                setErrors({
                    message: `Có lỗi xảy ra: ${error.response?.data?.message || error.message}`,
                });
            } finally {
                setLoading(false);
            }
        }
    };

    const isCreateDisabled = () => {
        return loading || !!productCodeError;
    };

    const isFieldValid = (value) => {
        return value && !isEmptyOrWhitespace(value);
    };

    const getFilteredMaterials = () => {
        return productMaterials.filter(item => {
            const searchLower = tableSearchQuery.toLowerCase().trim();
            return item.materialCode?.toLowerCase().includes(searchLower) ||
                item.materialName?.toLowerCase().includes(searchLower);
        });
    };

    const getPaginatedData = () => {
        const filteredData = getFilteredMaterials();
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredData.slice(startIndex, endIndex);
    };

    const handlePageChange = (selectedItem) => {
        setCurrentPage(selectedItem.selected);
    };

    useEffect(() => {
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    // Thêm hàm xử lý reset lỗi khi nhập
    const handleInputChange = (field, value) => {
        // Reset lỗi cho trường tương ứng
        setValidationErrors(prev => ({
            ...prev,
            [field]: "" // Xóa lỗi khi người dùng nhập
        }));

        // Cập nhật giá trị cho form
        setNewProduct(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Thêm hàm xử lý khi chọn đơn vị
    const handleUnitChange = (selectedOption) => {
        // Reset lỗi
        setValidationErrors(prev => ({
            ...prev,
            unitId: ""
        }));

        // Cập nhật giá trị
        setNewProduct(prev => ({
            ...prev,
            unitId: selectedOption ? selectedOption.value : ""
        }));
    };

    // Thêm hàm xử lý khi chọn dòng sản phẩm  
    const handleProductTypeChange = (selectedOption) => {
        // Reset lỗi
        setValidationErrors(prev => ({
            ...prev,
            productTypeId: ""
        }));

        // Cập nhật giá trị
        setNewProduct(prev => ({
            ...prev,
            productTypeId: selectedOption ? selectedOption.value : ""
        }));
    };

    // Thêm hàm lọc materials để loại bỏ những cái đã chọn
    const getAvailableMaterials = () => {
        const selectedMaterialIds = productMaterials.map(pm => pm.materialId);
        return materials.filter(m => !selectedMaterialIds.includes(m.materialId));
    };

    // Lấy danh sách đã lọc
    const filteredTableMaterials = getFilteredMaterials();

    // Sửa lại hàm validate khi thay đổi số lượng
    const handleQuantityChange = (index, value) => {
        const updatedMaterials = [...productMaterials];
        updatedMaterials[currentPage * pageSize + index].quantity = Number(value);
        setProductMaterials(updatedMaterials);

        // Validate số lượng
        if (!value || value <= 0) {
            setQuantityErrors(prev => ({
                ...prev,
                [currentPage * pageSize + index]: "Số lượng phải lớn hơn 0"
            }));
        } else {
            setQuantityErrors(prev => ({
                ...prev,
                [currentPage * pageSize + index]: ""
            }));
        }
    };

    return (
        <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">
                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title={"Tạo sản phẩm mới"}
                        addButtonLabel=""
                        onAdd={() => { }}
                        onImport={() => {/* Xử lý import nếu có */ }}
                        onExport={() => {/* Xử lý export file ở đây nếu có */ }}
                        showAdd={false}
                        showImport={false} // Ẩn nút import nếu không dùng
                        showExport={false} // Ẩn xuất file nếu không dùng
                    />
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
                                    className={`w-full ${errors.productCode ||
                                        productCodeError ||
                                        (validationErrors.productCode && !isFieldValid(newProduct.productCode))
                                        ? "border-red-500"
                                        : ""
                                        }`}
                                />
                                {(productCodeError || validationErrors.productCode || errors.productCode) && (
                                    <Typography className="text-xs text-red-500 mt-1">
                                        {productCodeError || validationErrors.productCode || errors.productCode}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                                    Đơn vị *
                                </Typography>
                                <Select
                                    placeholder="Chọn đơn vị"
                                    options={units.map((unit) => ({
                                        value: unit.unitId.toString(),
                                        label: unit.unitName,
                                    }))}
                                    styles={customStyles}
                                    value={
                                        units
                                            .map((unit) => ({
                                                value: unit.unitId.toString(),
                                                label: unit.unitName,
                                            }))
                                            .find((option) => option.value === newProduct.unitId?.toString()) || null
                                    }
                                    onChange={handleUnitChange}
                                />
                                {validationErrors.unitId && (
                                    <Typography className="text-xs text-red-500 mt-1">
                                        {validationErrors.unitId}
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
                                    onChange={(e) => handleInputChange("productName", e.target.value)}
                                    className={`w-full ${errors.productName ||
                                        (validationErrors.productName && !isFieldValid(newProduct.productName))
                                        ? "border-red-500"
                                        : ""
                                        }`}
                                />
                                {(validationErrors.productName || errors.productName) && (
                                    <Typography className="text-xs text-red-500 mt-1">
                                        {validationErrors.productName || errors.productName}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                                    Dòng sản phẩm *
                                </Typography>
                                <Select
                                    placeholder="Chọn dòng sản phẩm"
                                    options={productTypes.map((type) => ({
                                        value: type.typeId.toString(),
                                        label: type.typeName,
                                    }))}
                                    styles={customStyles}
                                    value={
                                        productTypes
                                            .map((type) => ({
                                                value: type.typeId.toString(),
                                                label: type.typeName,
                                            }))
                                            .find((option) => option.value === newProduct.productTypeId?.toString()) || null
                                    }
                                    onChange={handleProductTypeChange}
                                />
                                {validationErrors.productTypeId && (
                                    <Typography className="text-xs text-red-500 mt-1">
                                        {validationErrors.productTypeId}
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
                                            // Tạo preview URL và lưu vào state
                                            const previewUrl = URL.createObjectURL(file);
                                            setPreviewImage(previewUrl);
                                            setNewProduct((prev) => ({
                                                ...prev,
                                                image: file
                                            }));
                                        }
                                    }}
                                />
                                {/* Hiển thị ảnh preview */}
                                {previewImage && (
                                    <div className="mt-2 relative">
                                        <img
                                            src={previewImage}
                                            alt="Preview"
                                            className="w-32 h-32 object-cover rounded-lg"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'path_to_default_image.jpg';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Typography variant="h6" color="blue-gray" className="mb-4">
                            Định mức nguyên vật liệu
                        </Typography>

                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    Hiển thị
                                </Typography>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(0);
                                    }}
                                    className="border rounded px-2 py-1"
                                >
                                    {[5, 10, 20, 50].map(size => (
                                        <option key={size} value={size}>{size}</option>
                                    ))}
                                </select>
                                <Typography variant="small" color="blue-gray" className="font-normal">
                                    bản ghi mỗi trang
                                </Typography>
                            </div>

                            <div className="w-96 md:w-[900px]">
                                <Input
                                    label="Tìm kiếm trong danh sách"
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

                        {billOfMaterialsError && (
                            <Typography className="text-xs text-red-500 mb-2">
                                {billOfMaterialsError}
                            </Typography>
                        )}

                        <div className="border border-gray-200 rounded mb-4">
                            <table className="w-full text-left min-w-max border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        {["STT", "Mã NVL", "Tên NVL", "Đơn vị", "Số lượng *", "Thao tác"].map((head) => (
                                            <th
                                                key={head}
                                                className="px-4 py-2 text-sm font-semibold text-gray-600 border-r last:border-r-0"
                                            >
                                                {head}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {getPaginatedData().length > 0 ? (
                                        getPaginatedData().map((item, index) => (
                                            <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50">
                                                <td className="px-4 py-2 text-sm text-gray-700 border-r">
                                                    {currentPage * pageSize + index + 1}
                                                </td>
                                                <td className="px-4 py-2 text-sm border-r">
                                                    <Select
                                                        placeholder="Chọn nguyên vật liệu"
                                                        isSearchable
                                                        options={getAvailableMaterials().map((m) => ({
                                                            value: m.materialId,
                                                            label: `${m.materialCode} - ${m.materialName}`,
                                                            material: m,
                                                        }))}
                                                        styles={customStyles}
                                                        className="w-68"
                                                        value={
                                                            item.materialId
                                                                ? {
                                                                    value: item.materialId,
                                                                    label: `${item.materialCode} - ${item.materialName}`,
                                                                }
                                                                : null
                                                        }
                                                        onChange={(selected) => {
                                                            const material = selected.material;
                                                            handleSelectSuggestion(currentPage * pageSize + index, material);
                                                        }}
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-sm border-r">
                                                    <Input
                                                        variant="standard"
                                                        value={item.materialName}
                                                        disabled
                                                        className="w-full text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-sm border-r">
                                                    <Input
                                                        variant="standard"
                                                        value={item.unitName}
                                                        disabled
                                                        className="w-16 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-sm border-r">
                                                    <div>
                                                        <Input
                                                            type="number"
                                                            variant="standard"
                                                            value={item.quantity}
                                                            onChange={(e) => handleQuantityChange(currentPage * pageSize + index, e.target.value)}
                                                            min={1}
                                                            className={`w-16 text-sm ${quantityErrors[currentPage * pageSize + index] ? "border-red-500" : ""
                                                                }`}
                                                        />
                                                        {quantityErrors[currentPage * pageSize + index] && (
                                                            <div className="text-xs text-red-500 mt-1">
                                                                {quantityErrors[currentPage * pageSize + index]}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 text-sm text-center">
                                                    <Button
                                                        color="red"
                                                        variant="text"
                                                        size="sm"
                                                        onClick={() => {
                                                            setProductMaterials((prev) => prev.filter((_, i) => i !== (currentPage * pageSize + index)));
                                                            if (getPaginatedData().length === 1 && currentPage > 0) {
                                                                setCurrentPage(currentPage - 1);
                                                            }
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

                        {filteredTableMaterials.length > 0 && (
                            <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                        Trang {currentPage + 1} / {Math.ceil(filteredTableMaterials.length / pageSize)} •{" "}
                                        {filteredTableMaterials.length} bản ghi
                                    </Typography>
                                </div>
                                <ReactPaginate
                                    previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                                    nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                                    breakLabel="..."
                                    pageCount={Math.ceil(filteredTableMaterials.length / pageSize)}
                                    marginPagesDisplayed={2}
                                    pageRangeDisplayed={5}
                                    onPageChange={handlePageChange}
                                    containerClassName="flex items-center gap-1"
                                    pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                                    pageLinkClassName="flex items-center justify-center w-full h-full"
                                    previousClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                                    nextClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                                    breakClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700"
                                    activeClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
                                    forcePage={currentPage}
                                    disabledClassName="opacity-50 cursor-not-allowed"
                                />
                            </div>
                        )}

                        <div className="flex gap-2 mb-4">
                            <Button variant="outlined" onClick={handleAddRow} className="flex items-center gap-2">
                                <FaPlus /> Thêm dòng
                            </Button>
                            <Button
                                variant="outlined"
                                color="red"
                                onClick={handleRemoveAllRows}
                                className="flex items-center gap-2"
                            >
                                <FaTrash /> Xóa hết dòng
                            </Button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            variant="text"
                            color="gray"
                            onClick={() => navigate("/user/products")}
                            className="flex items-center gap-2"
                        >
                            <FaTimes /> Hủy
                        </Button>
                        <Button
                            variant="gradient"
                            color="green"
                            onClick={handleCreateProduct}
                            disabled={isCreateDisabled()}
                            className="flex items-center gap-2"
                        >
                            <FaSave /> {loading ? "Đang xử lý..." : "Lưu"}
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default AddProductPage;