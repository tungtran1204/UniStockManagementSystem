import React, { useState, useEffect } from 'react';
import {
    Typography,
    Button,
    Input,
    Select,
    Option,
} from "@material-tailwind/react";
import axios from 'axios';

const EditMaterialModal = ({ show, onClose, material, onUpdate, units = [], materialCategories = [] }) => {
    const [editedMaterial, setEditedMaterial] = useState({
        materialCode: "",
        materialName: "",
        description: "",
        unitId: "",
        categoryId: "",
        isUsing: false,
        image: null,
        imageUrl: null
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({
        materialCode: "",
        materialName: "",
        unitId: "",
        categoryId: "",
        description: ""
    });
    const [productCodeError, setProductCodeError] = useState(""); // State để lưu lỗi mã nguyên vật liệu tồn tại
    const [validationErrors, setValidationErrors] = useState({}); // State để lưu lỗi validation (khoảng trắng/trống)

    useEffect(() => {
        if (material) {
            console.log("Material data:", material);
            setEditedMaterial({
                materialId: material.materialId,
                materialCode: material.materialCode || "",
                materialName: material.materialName || "",
                description: material.description || "",
                unitId: material.unitId ? String(material.unitId) : "",
                categoryId: material.typeId ? String(material.typeId) : "",  // Giữ nguyên vì API trả về typeId cho material
                isUsing: material.isUsing || false,
                imageUrl: material.imageUrl || null
            });
        }
        console.log("Material Categories:", materialCategories);
    }, [material]);

    // Hàm kiểm tra chuỗi có chứa toàn khoảng trắng hoặc trống không
    const isEmptyOrWhitespace = (str) => !str || /^\s*$/.test(str);

    // Hàm kiểm tra mã nguyên vật liệu (kiểm tra ngay khi nhập, loại trừ materialId hiện tại)
    const handleCheckMaterialCode = async (newCode) => {
        setEditedMaterial({ ...editedMaterial, materialCode: newCode });
        setProductCodeError(""); // Reset lỗi mỗi khi nhập

        if (newCode.trim()) {
            try {
                const response = await axios.get(
                    `${import.meta.env.VITE_API_URL}/user/materials/check-material-code/${newCode}?excludeId=${editedMaterial.materialId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                );
                if (response.data.exists) {
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
        setEditedMaterial({ ...editedMaterial, materialName: newName });

        // Xóa lỗi validation nếu dữ liệu hợp lệ
        if (!isEmptyOrWhitespace(newName)) {
            setValidationErrors((prev) => ({ ...prev, materialName: "" }));
        }
    };

    // Hàm xử lý khi nhấn nút "Cập nhật"
    const handleUpdateMaterial = async () => {
        const newErrors = {};

        if (isEmptyOrWhitespace(editedMaterial.materialCode)) {
            newErrors.materialCode = "Mã nguyên vật liệu không được để trống hoặc chỉ chứa khoảng trắng!";
        }
        if (isEmptyOrWhitespace(editedMaterial.materialName)) {
            newErrors.materialName = "Tên nguyên vật liệu không được để trống hoặc chỉ chứa khoảng trắng!";
        }
        if (!editedMaterial.unitId) {
            newErrors.unitId = "Vui lòng chọn đơn vị!";
        }
        if (!editedMaterial.categoryId) {
            newErrors.categoryId = "Vui lòng chọn danh mục!";
        }

        setValidationErrors(newErrors);

        // Chỉ gọi API nếu không có lỗi validation và không có productCodeError
        if (Object.keys(newErrors).length === 0 && !productCodeError) {
            try {
                setLoading(true);

                const formData = new FormData();
                formData.append('materialCode', editedMaterial.materialCode);
                formData.append('materialName', editedMaterial.materialName);
                formData.append('description', editedMaterial.description || '');
                formData.append('unitId', editedMaterial.unitId || '');
                formData.append('categoryId', editedMaterial.categoryId || '');
                formData.append('isUsing', editedMaterial.isUsing);

                if (editedMaterial.image) {
                    formData.append('image', editedMaterial.image);
                }

                await axios.put(
                    `${import.meta.env.VITE_API_URL}/user/materials/${editedMaterial.materialId}`,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                    }
                );

                alert("Cập nhật nguyên vật liệu thành công!");
                onUpdate();
                onClose();
            } catch (error) {
                console.error("Lỗi khi cập nhật nguyên vật liệu:", error);
                alert(error.response?.data?.message || "Lỗi khi cập nhật nguyên vật liệu!");
            } finally {
                setLoading(false);
            }
        }
    };

    // Kiểm tra điều kiện để vô hiệu hóa nút "Cập nhật"
    const isUpdateDisabled = () => {
        return loading || !!productCodeError;
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px]">
                <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6">Chỉnh sửa nguyên vật liệu</Typography>
                    <button className="text-gray-500 hover:text-gray-700" onClick={() => {
                        onClose();
                        setProductCodeError("");
                        setValidationErrors({});
                    }}>
                        ✕
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <Typography variant="small" className="mb-2">Mã nguyên vật liệu *</Typography>
                        <Input
                            type="text"
                            value={editedMaterial.materialCode}
                            onChange={(e) => handleCheckMaterialCode(e.target.value)}
                            className={`w-full ${errors.materialCode || productCodeError || validationErrors.materialCode ? 'border-red-500' : ''}`}
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
                    <div>
                        <Typography variant="small" className="mb-2">Tên nguyên vật liệu *</Typography>
                        <Input
                            type="text"
                            value={editedMaterial.materialName}
                            onChange={(e) => handleMaterialNameChange(e.target.value)}
                            className={`w-full ${errors.materialName || validationErrors.materialName ? 'border-red-500' : ''}`}
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
                            value={editedMaterial.unitId || ""}
                            onChange={(value) => setEditedMaterial({ ...editedMaterial, unitId: value })}
                            className={`w-full ${errors.unitId || (validationErrors.unitId && !editedMaterial.unitId) ? 'border-red-500' : ''}`}
                            label="Chọn đơn vị"
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
                            value={editedMaterial.categoryId || ""}
                            onChange={(value) => setEditedMaterial({ ...editedMaterial, categoryId: value })}
                            className={`w-full ${errors.categoryId || (validationErrors.categoryId && !editedMaterial.categoryId) ? 'border-red-500' : ''}`}
                            label="Chọn danh mục"
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
                        {validationErrors.categoryId && (
                            <Typography className="text-xs text-red-500 mt-1">
                                {validationErrors.categoryId}
                            </Typography>
                        )}
                        {errors.categoryId && !validationErrors.categoryId && (
                            <Typography className="text-xs text-red-500 mt-1">
                                {errors.categoryId}
                            </Typography>
                        )}
                    </div>

                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Mô tả</Typography>
                        <Input
                            type="text"
                            value={editedMaterial.description}
                            onChange={(e) => setEditedMaterial({ ...editedMaterial, description: e.target.value })}
                            className={`w-full ${errors.description ? 'border-red-500' : ''}`}
                        />
                        {errors.description && (
                            <Typography className="text-xs text-red-500 mt-1">
                                {errors.description}
                            </Typography>
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
                                    setEditedMaterial((prev) => ({
                                        ...prev,
                                        image: file,
                                        imageUrl: URL.createObjectURL(file),
                                    }));
                                }
                            }}
                        />
                        {editedMaterial.imageUrl && (
                            <img src={editedMaterial.imageUrl} alt="Preview" className="w-32 h-32 object-cover mt-2" />
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button color="gray" onClick={() => {
                        onClose();
                        setProductCodeError("");
                        setValidationErrors({});
                    }} disabled={loading}>Hủy</Button>
                    <Button color="blue" onClick={handleUpdateMaterial} disabled={isUpdateDisabled()}>Cập nhật</Button>
                </div>
            </div>
        </div>
    );
};

export default EditMaterialModal;