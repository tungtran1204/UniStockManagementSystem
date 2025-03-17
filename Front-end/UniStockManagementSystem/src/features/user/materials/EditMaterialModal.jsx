import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Button,
    IconButton,
} from "@material-tailwind/react";
import { TextField, MenuItem, Divider, Select, FormControl, Button as MuiButton } from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
    const [materialCodeError, setMaterialCodeError] = useState(""); // State để lưu lỗi mã nguyên vật liệu tồn tại
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
        setMaterialCodeError(""); // Reset lỗi mỗi khi nhập

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
                    setMaterialCodeError("Mã nguyên vật liệu này đã tồn tại!");
                }
            } catch (error) {
                console.error("❌ Lỗi kiểm tra mã nguyên vật liệu:", error);
                setMaterialCodeError("Lỗi khi kiểm tra mã nguyên vật liệu!");
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

        // Chỉ gọi API nếu không có lỗi validation và không có materialCodeError
        if (Object.keys(newErrors).length === 0 && !materialCodeError) {
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
        return loading || !!materialCodeError;
    };

    if (!show) return null;

    return (
        <Dialog open={true} handler={onClose} size="md" className="px-4 py-2">
            {/* Header của Dialog */}
            <DialogHeader className="flex justify-between items-center pb-2">
                <Typography variant="h4" color="blue-gray">
                    Chỉnh sửa nguyên vật liệu
                </Typography>
                <IconButton
                    size="sm"
                    variant="text"
                    onClick={onClose}
                >
                    <XMarkIcon className="h-5 w-5 stroke-2" />
                </IconButton>
            </DialogHeader>
            <Divider variant="middle" />

            {/* Body của Dialog */}
            <DialogBody className="space-y-4 pb-6 pt-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <Typography variant="medium" className="text-black">
                            Mã nguyên vật liệu
                            <span className="text-red-500"> *</span>
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            hiddenLabel
                            placeholder="Mã nguyên vật liệu"
                            color="success"
                            value={editedMaterial.materialCode}
                            onChange={(e) => handleCheckMaterialCode(e.target.value)}
                        />
                        {materialCodeError && (<Typography className="text-xs text-red-500 mt-1">{materialCodeError}</Typography>)}
                        {validationErrors.materialCode && (<Typography className="text-xs text-red-500 mt-1">{validationErrors.materialCode}</Typography>)}
                        {errors.materialCode &&
                            !materialCodeError &&
                            !validationErrors.materialCode && (
                                <Typography className="text-xs text-red-500 mt-1">{errors.materialCode}</Typography>)}
                    </div>

                    <div>
                        <Typography variant="medium" className="text-black">
                            Tên nguyên vật liệu
                            <span className="text-red-500"> *</span>
                        </Typography>
                        <TextField
                            fullWidth
                            id="outlined-select"
                            size="small"
                            hiddenLabel
                            placeholder="Tên nguyên vật liệu"
                            color="success"
                            value={editedMaterial.materialName}
                            onChange={(e) => handleMaterialNameChange(e.target.value)}
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

                    <div>
                        <Typography variant="medium" className="text-black">
                            Đơn vị
                            <span className="text-red-500"> *</span>
                        </Typography>
                        <FormControl fullWidth size="small" hiddenLabel>
                            <Select
                                value={editedMaterial.unitId}
                                onChange={(e) => setEditedMaterial({ ...editedMaterial, unitId: e.target.value })}
                                color="success"
                                MenuProps={{
                                    disablePortal: true,
                                }}
                                displayEmpty
                                renderValue={editedMaterial.unitId !== "" ? undefined : () => <Typography className="text-[16px] text-gray-500">Đơn vị</Typography>}
                            >
                                {units.length > 0 ? (
                                    units.map((unit) => (
                                        <MenuItem
                                            key={unit.unitId}
                                            value={String(unit.unitId)}
                                            sx={{
                                                "&.Mui-selected": {
                                                    backgroundColor: "rgba(8, 148, 86, 0.1) !important",
                                                },
                                            }}>
                                            {unit.unitName}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>Không có đơn vị nào</MenuItem>
                                )}
                            </Select>
                        </FormControl>
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

                    <div>
                        <Typography variant="medium" className="text-black">
                            Danh mục
                            <span className="text-red-500"> *</span>
                        </Typography>
                        <FormControl fullWidth size="small" hiddenLabel>
                            <Select
                                value={editedMaterial.typeId}
                                onChange={(e) => setEditedMaterial({ ...editedMaterial, typeId: e.target.value })}
                                color="success"
                                MenuProps={{
                                    disablePortal: true,
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 200, // Giới hạn chiều cao menu
                                            overflowY: "auto",
                                        },
                                    },
                                }}
                                displayEmpty
                                renderValue={editedMaterial.typeId !== "" ? undefined : () => <Typography className="text-[16px] text-gray-500">Danh mục</Typography>}
                            >
                                {materialCategories.length > 0 ? (
                                    materialCategories.map((category) => (
                                        <MenuItem
                                            key={category.materialTypeId}
                                            value={String(category.materialTypeId)}
                                            sx={{
                                                "&.Mui-selected": {
                                                    backgroundColor: "rgba(8, 148, 86, 0.1) !important",
                                                },
                                            }}>
                                            {category.name}
                                        </MenuItem>
                                    ))
                                ) : (
                                    <MenuItem disabled>Không có danh mục nào</MenuItem>
                                )}
                            </Select>
                        </FormControl>
                        {validationErrors.typeId && (
                            <Typography className="text-xs text-red-500 mt-1">
                                {validationErrors.typeId}
                            </Typography>
                        )}
                        {errors.typeId && !validationErrors.typeId && (
                            <Typography className="text-xs text-red-500 mt-1">
                                {errors.typeId}
                            </Typography>
                        )}
                    </div>

                    <div className="col-span-2">
                        <Typography variant="medium" className="text-black">
                            Mô tả
                            <span className="text-red-500"> *</span>
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            hiddenLabel
                            placeholder="Mô tả"
                            color="success"
                            multiline
                            rows={4}
                            value={editedMaterial.description}
                            onChange={(e) => setEditedMaterial({ ...editedMaterial, description: e.target.value })}
                        />
                        {errors.description && (
                            <Typography className="text-xs text-red-500 mt-1">{errors.description}</Typography>
                        )}
                    </div>

                    <div className="col-span-2">
                        <Typography variant="medium" className="text-black">
                            Hình ảnh nguyên vật liệu
                            <span className="text-red-500"> *</span>
                        </Typography>
                        <TextField
                            fullWidth
                            type="file"
                            accept="image/*"
                            size="small"
                            hiddenLabel
                            color="success"
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
                        />
                        {editedMaterial.imageUrl && (
                            <div className="mt-2 relative">
                                <img
                                    src={editedMaterial.imageUrl}
                                    alt="Preview"
                                    className="w-32 h-32 object-cover rounded-lg border"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </DialogBody>

            {/* Footer của Dialog */}
            <DialogFooter className="pt-0">
                <MuiButton
                    size="medium"
                    color="error"
                    variant="outlined"
                    onClick={onClose}
                >
                    Hủy
                </MuiButton>
                <Button
                    size="lg"
                    color="white"
                    variant="text"
                    className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 ml-3 rounded-[4px] transition-all duration-200 ease-in-out"
                    ripple={true}
                    onClick={handleUpdateMaterial}
                >
                    Lưu
                </Button>
            </DialogFooter>
        </Dialog>
        // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        //     <div className="bg-white rounded-lg p-6 w-[500px]">
        //         <div className="flex justify-between items-center mb-4">
        //             <Typography variant="h6">Chỉnh sửa nguyên vật liệu</Typography>
        //             <button className="text-gray-500 hover:text-gray-700" onClick={() => {
        //                 onClose();
        //                 setMaterialCodeError("");
        //                 setValidationErrors({});
        //             }}>
        //                 ✕
        //             </button>
        //         </div>
        //         <div className="grid grid-cols-2 gap-4 mb-4">
        //             <div>
        //                 <Typography variant="small" className="mb-2">Mã nguyên vật liệu *</Typography>
        //                 <Input
        //                     type="text"
        //                     value={editedMaterial.materialCode}
        //                     onChange={(e) => handleCheckMaterialCode(e.target.value)}
        //                     className={`w-full ${errors.materialCode || materialCodeError || validationErrors.materialCode ? 'border-red-500' : ''}`}
        //                 />
        //                 {materialCodeError && (
        //                     <Typography className="text-xs text-red-500 mt-1">
        //                         {materialCodeError}
        //                     </Typography>
        //                 )}
        //                 {validationErrors.materialCode && (
        //                     <Typography className="text-xs text-red-500 mt-1">
        //                         {validationErrors.materialCode}
        //                     </Typography>
        //                 )}
        //                 {errors.materialCode && !materialCodeError && !validationErrors.materialCode && (
        //                     <Typography className="text-xs text-red-500 mt-1">
        //                         {errors.materialCode}
        //                     </Typography>
        //                 )}
        //             </div>
        //             <div>
        //                 <Typography variant="small" className="mb-2">Tên nguyên vật liệu *</Typography>
        //                 <Input
        //                     type="text"
        //                     value={editedMaterial.materialName}
        //                     onChange={(e) => handleMaterialNameChange(e.target.value)}
        //                     className={`w-full ${errors.materialName || validationErrors.materialName ? 'border-red-500' : ''}`}
        //                 />
        //                 {validationErrors.materialName && (
        //                     <Typography className="text-xs text-red-500 mt-1">
        //                         {validationErrors.materialName}
        //                     </Typography>
        //                 )}
        //                 {errors.materialName && !validationErrors.materialName && (
        //                     <Typography className="text-xs text-red-500 mt-1">
        //                         {errors.materialName}
        //                     </Typography>
        //                 )}
        //             </div>

        //             {/* Đơn vị */}
        //             <div>
        //                 <Typography variant="small" className="mb-2">Đơn vị *</Typography>
        //                 <Select
        //                     value={editedMaterial.unitId || ""}
        //                     onChange={(value) => setEditedMaterial({ ...editedMaterial, unitId: value })}
        //                     className={`w-full ${errors.unitId || (validationErrors.unitId && !editedMaterial.unitId) ? 'border-red-500' : ''}`}
        //                     label="Chọn đơn vị"
        //                 >
        //                     {units.length > 0 ? (
        //                         units.map((unit) => (
        //                             <Option key={unit.unitId} value={String(unit.unitId)}>
        //                                 {unit.unitName}
        //                             </Option>
        //                         ))
        //                     ) : (
        //                         <Option disabled>Không có đơn vị nào</Option>
        //                     )}
        //                 </Select>
        //                 {validationErrors.unitId && (
        //                     <Typography className="text-xs text-red-500 mt-1">
        //                         {validationErrors.unitId}
        //                     </Typography>
        //                 )}
        //                 {errors.unitId && !validationErrors.unitId && (
        //                     <Typography className="text-xs text-red-500 mt-1">
        //                         {errors.unitId}
        //                     </Typography>
        //                 )}
        //             </div>

        //             {/* Danh mục */}
        //             <div>
        //                 <Typography variant="small" className="mb-2">Danh mục *</Typography>
        //                 <Select
        //                     value={editedMaterial.categoryId || ""}
        //                     onChange={(value) => setEditedMaterial({ ...editedMaterial, categoryId: value })}
        //                     className={`w-full ${errors.categoryId || (validationErrors.categoryId && !editedMaterial.categoryId) ? 'border-red-500' : ''}`}
        //                     label="Chọn danh mục"
        //                 >
        //                     {materialCategories.length > 0 ? (
        //                         materialCategories.map((category) => (
        //                             <Option key={category.materialTypeId} value={String(category.materialTypeId)}>
        //                                 {category.name}
        //                             </Option>
        //                         ))
        //                     ) : (
        //                         <Option disabled>Không có danh mục nào</Option>
        //                     )}
        //                 </Select>
        //                 {validationErrors.categoryId && (
        //                     <Typography className="text-xs text-red-500 mt-1">
        //                         {validationErrors.categoryId}
        //                     </Typography>
        //                 )}
        //                 {errors.categoryId && !validationErrors.categoryId && (
        //                     <Typography className="text-xs text-red-500 mt-1">
        //                         {errors.categoryId}
        //                     </Typography>
        //                 )}
        //             </div>

        //             <div className="col-span-2">
        //                 <Typography variant="small" className="mb-2">Mô tả</Typography>
        //                 <Input
        //                     type="text"
        //                     value={editedMaterial.description}
        //                     onChange={(e) => setEditedMaterial({ ...editedMaterial, description: e.target.value })}
        //                     className={`w-full ${errors.description ? 'border-red-500' : ''}`}
        //                 />
        //                 {errors.description && (
        //                     <Typography className="text-xs text-red-500 mt-1">
        //                         {errors.description}
        //                     </Typography>
        //                 )}
        //             </div>

        //             {/* Ảnh nguyên vật liệu */}
        //             <div className="col-span-2">
        //                 <Typography variant="small" className="mb-2">Hình ảnh nguyên vật liệu</Typography>
        //                 <Input
        //                     type="file"
        //                     accept="image/*"
        //                     onChange={(e) => {
        //                         const file = e.target.files[0];
        //                         if (file) {
        //                             if (file.size > 5 * 1024 * 1024) {
        //                                 alert("Kích thước file không được vượt quá 5MB");
        //                                 e.target.value = "";
        //                                 return;
        //                             }
        //                             setEditedMaterial((prev) => ({
        //                                 ...prev,
        //                                 image: file,
        //                                 imageUrl: URL.createObjectURL(file),
        //                             }));
        //                         }
        //                     }}
        //                 />
        //                 {editedMaterial.imageUrl && (
        //                     <img src={editedMaterial.imageUrl} alt="Preview" className="w-32 h-32 object-cover mt-2" />
        //                 )}
        //             </div>
        //         </div>

        //         <div className="flex justify-end gap-2">
        //             <Button color="gray" onClick={() => {
        //                 onClose();
        //                 setMaterialCodeError("");
        //                 setValidationErrors({});
        //             }} disabled={loading}>Hủy</Button>
        //             <Button color="blue" onClick={handleUpdateMaterial} disabled={isUpdateDisabled()}>Cập nhật</Button>
        //         </div>
        //     </div>
        // </div>
    );
};

export default EditMaterialModal;