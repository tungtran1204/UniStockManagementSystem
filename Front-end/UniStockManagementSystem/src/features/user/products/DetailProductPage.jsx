import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Input,
} from "@material-tailwind/react";
import { FaEdit, FaArrowLeft, FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { getProductById, updateProduct, fetchUnits, fetchProductTypes, checkProductCodeExists } from "./productService";
import Select from "react-select";
import axios from "axios";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import ReactPaginate from "react-paginate";

const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
};

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

const DetailProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [units, setUnits] = useState([]);
    const [productTypes, setProductTypes] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [editedProduct, setEditedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState(null);
    const [errors, setErrors] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(5);
    const [previewImage, setPreviewImage] = useState(null);
    const [tableSearchQuery, setTableSearchQuery] = useState("");
    const [currentRow, setCurrentRow] = useState(-1);
    const [quantityErrors, setQuantityErrors] = useState({}); // Thêm state cho lỗi số lượng

    const fetchProductMaterials = async (productId) => {
        try {
            const response = await axios.get(
                `http://localhost:8080/api/unistock/user/product-materials/${productId}`,
                { headers: authHeader(), params: { page: 0, size: 1000 } }
            );

            console.log("📌 API Product Materials Response:", response.data);

            if (response.data && Array.isArray(response.data.content)) {
                const updatedMaterials = response.data.content.map(pm => {
                    const materialData = materials.find(m => m.materialId === pm.materialId);
                    return {
                        materialId: pm.materialId,
                        materialCode: pm.materialCode,
                        materialName: pm.materialName,
                        quantity: pm.quantity // Loại bỏ unitName khỏi state
                    };
                });

                console.log("📌 Updated Materials:", updatedMaterials);

                setEditedProduct(prev => ({
                    ...prev,
                    materials: updatedMaterials
                }));
            } else {
                console.warn("📌 Response data is not an array:", response.data);
                setEditedProduct(prev => ({
                    ...prev,
                    materials: []
                }));
            }
        } catch (error) {
            console.error("❌ Error fetching product materials:", error.response?.data || error.message);
            setEditedProduct(prev => ({
                ...prev,
                materials: []
            }));
            alert("Không thể tải định mức nguyên vật liệu. Vui lòng thử lại!");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productData = await getProductById(id);
                console.log("📌 Product Data:", productData);
                
                // Lấy danh sách dòng sản phẩm đang hoạt động
                const activeProductTypes = await fetchProductTypes();
                
                // Tìm kiếm trong danh sách đã được lọc
                const matchingType = activeProductTypes.find(
                    (type) => type.typeName === productData.typeName
                );

                const updatedProductData = {
                    ...productData,
                    typeId: matchingType ? matchingType.typeId : "",
                    typeName: productData.typeName,
                };

                setProduct(updatedProductData);
                setEditedProduct(updatedProductData);
                setInitialValues(updatedProductData);

                const [unitsData, materialsData] = await Promise.all([
                    fetchUnits(),
                    axios.get("http://localhost:8080/api/unistock/user/materials", {
                        headers: authHeader(),
                        withCredentials: true,
                    }).then(res => res.data.content || [])
                ]);

                setUnits(unitsData);
                setProductTypes(activeProductTypes); // Sử dụng danh sách đã lọc
                setMaterials(materialsData);
            } catch (error) {
                console.error("❌ Error:", error);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (materials.length > 0 && id) {
            fetchProductMaterials(id);
        }
    }, [materials, id]);

    useEffect(() => {
        return () => {
            if (previewImage) {
                URL.revokeObjectURL(previewImage);
            }
        };
    }, [previewImage]);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setEditedProduct(initialValues);
        setIsEditing(false);
        setValidationErrors({});
        setPreviewImage(null);
    };

    const handleSave = async () => {
        const newErrors = {};

        if (!editedProduct.productName || editedProduct.productName.trim() === "") {
            newErrors.productName = "Tên sản phẩm không được để trống!";
        }
        if (!editedProduct.unitId) {
            newErrors.unitId = "Đơn vị không được bỏ trống!";
        }
        if (!editedProduct.typeId) {
            newErrors.typeId = "Dòng sản phẩm không được bỏ trống!";
        }

        const hasIncompleteMaterial = editedProduct.materials.some(
            (item) =>
                !item.materialId ||
                !item.materialCode ||
                !item.materialName ||
                !item.quantity ||
                item.quantity <= 0
        );
        if (hasIncompleteMaterial) {
            newErrors.materials = "Vui lòng điền đầy đủ thông tin cho tất cả các dòng nguyên vật liệu!";
        }

        // Kiểm tra mã sản phẩm trùng lặp
        if (editedProduct.productCode !== initialValues.productCode) {
            const codeExists = await checkProductCodeExists(editedProduct.productCode, id);
            if (codeExists) {
                newErrors.productCode = "Mã sản phẩm đã tồn tại!";
            }
        }

        setValidationErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                setLoading(true);

                // Chuẩn bị dữ liệu để gửi
                const dataToSend = {
                    ...editedProduct,
                    materials: editedProduct.materials.map(material => ({
                        materialId: material.materialId,
                        quantity: material.quantity,
                        materialCode: material.materialCode,
                        materialName: material.materialName
                    }))
                };

                // Cập nhật thông tin sản phẩm (bao gồm materials)
                const updatedProductData = await updateProduct(id, dataToSend);

                // Cập nhật lại state với dữ liệu mới từ backend
                const matchingType = productTypes.find(
                    (type) => type.typeName === updatedProductData.typeName
                );
                setProduct({
                    ...updatedProductData,
                    typeId: matchingType ? matchingType.typeId : "",
                    typeName: updatedProductData.typeName,
                });
                setEditedProduct({
                    ...updatedProductData,
                    typeId: matchingType ? matchingType.typeId : "",
                    typeName: updatedProductData.typeName,
                });
                setInitialValues({
                    ...updatedProductData,
                    typeId: matchingType ? matchingType.typeId : "",
                    typeName: updatedProductData.typeName,
                });

                // Backend đã xử lý materials, nhưng frontend vẫn cần gọi lại API product-materials để cập nhật giao diện
                await fetchProductMaterials(id);

                setIsEditing(false);
                setPreviewImage(null);
                alert("Cập nhật sản phẩm thành công!");
            } catch (error) {
                console.error("❌ Error:", error.response?.data || error.message);
                alert("Lỗi khi cập nhật sản phẩm: " + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        }
    };

    const handleAddRow = () => {
        setEditedProduct((prev) => ({
            ...prev,
            materials: [
                ...prev.materials,
                { materialId: "", materialCode: "", materialName: "", quantity: 1 },
            ],
        }));
    };

    const handleRemoveRow = (index) => {
        setEditedProduct(prev => ({
            ...prev,
            materials: prev.materials.filter((_, i) => i !== index)
        }));
    };

    const handleRemoveAllRows = () => {
        setEditedProduct({
            ...editedProduct,
            materials: [],
        });
    };

    const getFilteredMaterials = () => {
        if (!editedProduct?.materials) return [];
        return editedProduct.materials.filter(item => {
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

    // Sửa lại hàm getAvailableMaterials 
    const getAvailableMaterials = (currentIndex) => {
        if (!editedProduct?.materials) return materials;

        // Lấy danh sách ID vật tư đã chọn trừ vật tư của dòng hiện tại
        const selectedMaterialIds = editedProduct.materials
            .filter((_, idx) => idx !== currentIndex)
            .map(m => m.materialId);

        // Trả về tất cả vật tư chưa được chọn
        return materials.filter(m => !selectedMaterialIds.includes(m.materialId));
    };

    // Sửa lại hàm handleMaterialChange
    const handleMaterialChange = (index, selected) => {
        if (!selected) return; // Thêm check này để tránh lỗi khi selected là null

        const updatedMaterials = [...editedProduct.materials];
        updatedMaterials[index] = {
            ...updatedMaterials[index],
            materialId: selected.value, // Thay đổi từ material.materialId sang selected.value
            materialCode: selected.material.materialCode,
            materialName: selected.material.materialName,
            quantity: updatedMaterials[index].quantity || 1
        };
        setEditedProduct(prev => ({
            ...prev,
            materials: updatedMaterials,
        }));
    };

    // Sửa lại hàm handleQuantityChange
    const handleQuantityChange = (index, value) => {
        const updatedMaterials = [...editedProduct.materials];
        updatedMaterials[index].quantity = Number(value);
        setEditedProduct(prev => ({
            ...prev,
            materials: updatedMaterials,
        }));

        // Validate số lượng
        if (!value || value <= 0) {
            setQuantityErrors(prev => ({
                ...prev,
                [index]: "Số lượng phải lớn hơn 0"
            }));
        } else {
            setQuantityErrors(prev => ({
                ...prev,
                [index]: ""
            }));
        }
    };

    if (!product) return <div>Loading...</div>;

    return (
        <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
            <Card className="bg-gray-50 p-7 rounded-none shadow-none">
                {/* <CardHeader variant="gradient" color="gray" className="mb-4 p-4">
                    <div className="flex justify-between items-center">
                        <Typography variant="h6" color="white">
                            Chi tiết sản phẩm
                        </Typography>
                        <div className="flex gap-2">
                            {!isEditing ? (
                                <>
                                    <Button
                                        variant="text"
                                        color="white"
                                        onClick={() => navigate("/user/products")}
                                        className="flex items-center gap-2"
                                    >
                                        <FaArrowLeft /> Quay lại
                                    </Button>
                                    <Button
                                        variant="text"
                                        color="white"
                                        onClick={handleEdit}
                                        className="flex items-center gap-2"
                                    >
                                        <FaEdit /> Chỉnh sửa
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="text"
                                        color="white"
                                        onClick={handleCancel}
                                        className="flex items-center gap-2"
                                    >
                                        <FaTimes /> Hủy
                                    </Button>
                                    <Button
                                        variant="text"
                                        color="white"
                                        onClick={handleSave}
                                        className="flex items-center gap-2"
                                        disabled={loading}
                                    >
                                        <FaSave /> {loading ? "Đang xử lý..." : "Lưu"}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader> */}

                <CardBody className="pb-2 bg-white rounded-xl">
                    <PageHeader
                        title={"Chi tiết sản phẩm"}
                        addButtonLabel=""
                        onAdd={() => { }}
                        onImport={() => {/* Xử lý import nếu có */ }}
                        onExport={() => {/* Xử lý export file ở đây nếu có */ }}
                        showAdd={false}
                        showImport={false} // Ẩn nút import nếu không dùng
                        showExport={false} // Ẩn xuất file nếu không dùng
                    />
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                        <div className="flex flex-col gap-4">
                            <div>
                                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                                    Mã sản phẩm
                                </Typography>
                                <Input
                                    type="text"
                                    value={editedProduct?.productCode || ""}
                                    onChange={(e) =>
                                        setEditedProduct({ ...editedProduct, productCode: e.target.value })
                                    }
                                    disabled={!isEditing}
                                    className={`w-full ${validationErrors.productCode ? "border-red-500" : ""}`}
                                />
                                {validationErrors.productCode && (
                                    <Typography className="text-xs text-red-500 mt-1">
                                        {validationErrors.productCode}
                                    </Typography>
                                )}
                            </div>

                            <div>
                                <Typography variant="small" className="mb-2 text-gray-900 font-bold">
                                    Đơn vị
                                </Typography>
                                <Select
                                    placeholder="Chọn đơn vị"
                                    options={units.map((unit) => ({
                                        value: unit.unitId.toString(),
                                        label: unit.unitName,
                                    }))}
                                    value={
                                        units
                                            .map((unit) => ({
                                                value: unit.unitId.toString(),
                                                label: unit.unitName,
                                            }))
                                            .find((option) => option.value === editedProduct?.unitId?.toString()) ||
                                        null
                                    }
                                    onChange={(selectedOption) =>
                                        setEditedProduct({
                                            ...editedProduct,
                                            unitId: selectedOption ? selectedOption.value : "",
                                        })
                                    }
                                    isDisabled={!isEditing}
                                    styles={customStyles}
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
                                    value={editedProduct?.description || ""}
                                    onChange={(e) =>
                                        setEditedProduct({ ...editedProduct, description: e.target.value })
                                    }
                                    disabled={!isEditing}
                                    className="w-full disabled:bg-gray-100"
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
                                    value={editedProduct?.productName || ""}
                                    onChange={(e) =>
                                        setEditedProduct({ ...editedProduct, productName: e.target.value })
                                    }
                                    className={`w-full ${validationErrors.productName || errors.productName ? "border-red-500" : ""}`}
                                    disabled={!isEditing}
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
                                    placeholder="Chọn dòng sản phẩm"
                                    options={productTypes.map((type) => ({
                                        value: type.typeId.toString(),
                                        label: type.typeName,
                                    }))}
                                    value={
                                        productTypes
                                            .map((type) => ({
                                                value: type.typeId.toString(),
                                                label: type.typeName,
                                            }))
                                            .find(
                                                (option) =>
                                                    option.value === editedProduct?.typeId?.toString()
                                            ) || null
                                    }
                                    onChange={(selectedOption) =>
                                        setEditedProduct({
                                            ...editedProduct,
                                            typeId: selectedOption ? selectedOption.value : "",
                                            typeName: selectedOption ? selectedOption.label : "",
                                        })
                                    }
                                    isDisabled={!isEditing}
                                    styles={customStyles}
                                />
                                {validationErrors.typeId && (
                                    <Typography className="text-xs text-red-500 mt-1">
                                        {validationErrors.typeId}
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
                                            const previewUrl = URL.createObjectURL(file);
                                            setPreviewImage(previewUrl);
                                            setEditedProduct((prev) => ({
                                                ...prev,
                                                image: file,
                                                imageUrl: null
                                            }));
                                        }
                                    }}
                                    disabled={!isEditing}
                                />
                                {(previewImage || editedProduct?.imageUrl) && (
                                    <div className="mt-2 relative">
                                        <img
                                            src={previewImage || editedProduct.imageUrl}
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

                        {validationErrors.materials && (
                            <Typography className="text-xs text-red-500 mb-2">
                                {validationErrors.materials}
                            </Typography>
                        )}

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

                        <div className="border border-gray-200 rounded mb-4">
                            <table className="w-full text-left min-w-max border-collapse">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        {["STT", "Mã NVL", "Tên NVL", "Đơn vị", "Số lượng", "Thao tác"].map((head) => (
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
                                        getPaginatedData().map((item, index) => {
                                            const globalIndex = currentPage * pageSize + index;
                                            const materialData = materials.find(m => m.materialId === item.materialId);
                                            return (
                                                <tr
                                                    key={item.materialId || globalIndex}
                                                    className="border-b last:border-b-0 hover:bg-gray-50"
                                                >
                                                    <td className="px-4 py-2 text-sm text-gray-700 border-r">
                                                        {globalIndex + 1}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm border-r">
                                                        {isEditing ? (
                                                            <Select
                                                                placeholder="Chọn nguyên vật liệu"
                                                                isSearchable
                                                                options={getAvailableMaterials(globalIndex).map((m) => ({
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
                                                                onFocus={() => setCurrentRow(globalIndex)} // Thêm handler này
                                                                onChange={(selected) => handleMaterialChange(globalIndex, selected)}
                                                            />
                                                        ) : (
                                                            <Input
                                                                variant="standard"
                                                                value={item.materialCode || ""}
                                                                disabled
                                                                className="w-full text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                                            />
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm border-r">
                                                        <Input
                                                            variant="standard"
                                                            value={item.materialName || ""}
                                                            disabled
                                                            className="w-full text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-sm border-r">
                                                        <Input
                                                            variant="standard"
                                                            value={materialData ? materialData.unitName : ""}
                                                            disabled
                                                            className="w-16 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-2 text-sm border-r">
                                                        <div>
                                                            <Input
                                                                type="number"
                                                                variant="standard"
                                                                value={item.quantity || ""}
                                                                onChange={(e) => handleQuantityChange(globalIndex, e.target.value)}
                                                                min={1}
                                                                className={`w-16 text-sm ${quantityErrors[globalIndex] ? "border-red-500" : ""
                                                                    }`}
                                                                disabled={!isEditing}
                                                            />
                                                            {isEditing && quantityErrors[globalIndex] && (
                                                                <div className="text-xs text-red-500 mt-1">
                                                                    {quantityErrors[globalIndex]}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-center">
                                                        {isEditing && (
                                                            <Button
                                                                color="red"
                                                                variant="text"
                                                                size="sm"
                                                                onClick={() => handleRemoveRow(globalIndex)}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="px-4 py-2 text-center text-gray-500"
                                            >
                                                Không có dữ liệu định mức nguyên vật liệu
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {editedProduct?.materials?.length > 0 && (
                            <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
                                <div className="flex items-center gap-2">
                                    <Typography variant="small" color="blue-gray" className="font-normal">
                                        Trang {currentPage + 1} / {Math.ceil(getFilteredMaterials().length / pageSize)} •{" "}
                                        {getFilteredMaterials().length} dòng
                                    </Typography>
                                </div>
                                <ReactPaginate
                                    previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                                    nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                                    breakLabel="..."
                                    pageCount={Math.ceil(getFilteredMaterials().length / pageSize)}
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

                        {isEditing && (
                            <div className="flex gap-2 mb-4">
                                <Button
                                    variant="outlined"
                                    onClick={handleAddRow}
                                    className="flex items-center gap-2"
                                >
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
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default DetailProductPage;