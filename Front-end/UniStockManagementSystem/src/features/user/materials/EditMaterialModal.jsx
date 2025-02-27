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

    useEffect(() => {
        if (material) {
            setEditedMaterial({
                materialId: material.materialId,
                materialCode: material.materialCode || "",
                materialName: material.materialName || "",
                description: material.description || "",
                unitId: material.unitId ? String(material.unitId) : "",  // ✅ Kiểm tra trước khi gọi .toString()
                categoryId: material.typeId ? String(material.categoryId) : "",  // ✅ Kiểm tra trước khi gọi .toString()
                isUsing: material.isUsing || false,
                imageUrl: material.imageUrl || null
            });
        }
    }, [material]);

    const validateMaterial = async (material) => {
        const newErrors = {
            materialCode: "",
            materialName: "",
            unitId: "",
            categoryId: "",
            description: ""
        };
        let isValid = true;

        if (!material.materialCode.trim()) {
            newErrors.materialCode = "Mã nguyên vật liệu không được để trống";
            isValid = false;
        }

        if (!material.materialName.trim()) {
            newErrors.materialName = "Tên nguyên vật liệu không được để trống";
            isValid = false;
        }

        if (!material.unitId) {
            newErrors.unitId = "Vui lòng chọn đơn vị";
            isValid = false;
        }

        if (!material.categoryId) {
            newErrors.categoryId = "Vui lòng chọn danh mục";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleUpdateMaterial = async () => {
        try {
            setErrors({});
            const isValid = await validateMaterial(editedMaterial);
            if (!isValid) return;

            setLoading(true);

            const formData = new FormData();
            formData.append('materialCode', editedMaterial.materialCode);
            formData.append('materialName', editedMaterial.materialName);
            formData.append('description', editedMaterial.description || '');
            formData.append('unitId', editedMaterial.unitId || '');
            formData.append('categoryId', editedMaterial.categoryId || '');
            formData.append('isUsingActive', editedMaterial.isUsing);

            if (editedMaterial.image) {
                formData.append('image', editedMaterial.image);
            }

            await axios.put(
                `http://localhost:8080/api/unistock/user/materials/${editedMaterial.materialId}`,
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
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px]">
                <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6">Chỉnh sửa nguyên vật liệu</Typography>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <Typography variant="small" className="mb-2">Mã nguyên vật liệu *</Typography>
                        <Input
                            type="text"
                            value={editedMaterial.materialCode}
                            onChange={(e) => setEditedMaterial({ ...editedMaterial, materialCode: e.target.value })}
                            className={`w-full ${errors.materialCode ? 'border-red-500' : ''}`}
                        />
                        {errors.materialCode && (
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
                            onChange={(e) => setEditedMaterial({ ...editedMaterial, materialName: e.target.value })}
                            className={`w-full ${errors.materialName ? 'border-red-500' : ''}`}
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
                            value={editedMaterial.unitId || ""}
                            onChange={(value) => setEditedMaterial({ ...editedMaterial, unitId: value })}
                            className={`w-full ${errors.unitId ? 'border-red-500' : ''}`}
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
                    </div>

                    {/* Danh mục */}
                    <div>
                        <Typography variant="small" className="mb-2">Danh mục *</Typography>
                        <Select
                            value={editedMaterial.categoryId || ""}
                            onChange={(value) => setEditedMaterial({ ...editedMaterial, categoryId: value })}
                            className={`w-full ${errors.categoryId ? 'border-red-500' : ''}`}
                            label="Chọn danh mục"
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
                    </div>

                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Mô tả</Typography>
                        <Input
                            type="text"
                            value={editedMaterial.description}
                            onChange={(e) => setEditedMaterial({ ...editedMaterial, description: e.target.value })}
                            className={`w-full ${errors.description ? 'border-red-500' : ''}`}
                        />
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
                                    setEditedMaterial((prev) => ({
                                        ...prev,
                                        image: file,
                                        imageUrl: URL.createObjectURL(file),
                                    }));
                                }
                            }}
                        />
                        {editedMaterial.imageUrl && <img src={editedMaterial.imageUrl} alt="Preview" className="w-32 h-32 object-cover mt-2" />}
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button color="gray" onClick={onClose} disabled={loading}>Hủy</Button>
                    <Button color="blue" onClick={handleUpdateMaterial} disabled={loading}>Cập nhật</Button>
                </div>
            </div>
        </div>
    );
};

export default EditMaterialModal;
