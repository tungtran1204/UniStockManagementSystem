import React, { useState, useEffect } from "react";
import { updatePartnerType } from "./partnerTypeService";
import { Typography, Input, Textarea, Button, Select, Option } from "@material-tailwind/react";

const EditPartnerTypePopup = ({ partnerType, onClose, onSuccess }) => {
    const [editPartnerType, setEditPartnerType] = useState(partnerType);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorTypeCode, setErrorTypeCode] = useState("");
    const [errorTypeName, setErrorTypeName] = useState("");

    useEffect(() => {
        setEditPartnerType(partnerType);
    }, [partnerType]);

    const resetErrorMessages = () => {
        setErrorMessage("");
        setErrorTypeCode("");
        setErrorTypeName("");
    };

    const validatePartnerType = (partnerType) => {
        let isValid = true;
        setErrorTypeCode("");
        setErrorTypeName("");
        setErrorMessage("");

        if (!partnerType.typeCode.trim()) {
            setErrorTypeCode("Mã nhóm đối tác không được để trống.");
            isValid = false;
        }

        if (!partnerType.typeName.trim()) {
            setErrorTypeName("Tên nhóm đối tác không được để trống.");
            isValid = false;
        }

        return isValid;
    };

    const handleEditPartnerType = async () => {
        resetErrorMessages(); // Xóa lỗi trước khi kiểm tra

        if (!validatePartnerType(editPartnerType)) {
            return; // Nếu có lỗi, dừng không gọi API
        }

        try {
            await updatePartnerType(editPartnerType);
            onSuccess(); // Load lại danh sách sau khi cập nhật thành công
            onClose();
            setEditPartnerType(null);
        } catch (error) {
            console.error("Lỗi khi cập nhật nhóm đối tác:", error);
            if (error.response && error.response.status === 409) {
                const errorCode = error.response.data;

                if (errorCode === "DUPLICATE_CODE_AND_NAME") {
                    setErrorMessage("Mã nhóm đối tác và tên nhóm đối tác đã tồn tại.");
                } else if (errorCode === "DUPLICATE_CODE") {
                    setErrorTypeCode("Mã nhóm đối tác đã tồn tại.");
                } else if (errorCode === "DUPLICATE_NAME") {
                    setErrorTypeName("Tên nhóm đối tác đã tồn tại.");
                }
            } else {
                alert("Lỗi khi cập nhật nhóm đối tác! Vui lòng thử lại.");
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px]">
                <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6">Chỉnh sửa nhóm đối tác</Typography>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
                </div>
                {errorMessage && (
                    <Typography variant="small" color="red" className="mb-4">
                        {errorMessage}
                    </Typography>
                )}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Mã nhóm đối tác *</Typography>
                        <Input
                            type="text"
                            value={editPartnerType.typeCode}
                            onChange={(e) => {
                                setEditPartnerType({ ...editPartnerType, typeCode: e.target.value });
                                setErrorTypeCode(""); // Reset lỗi khi user nhập lại
                            }}
                            className="w-full"
                        />
                        {errorTypeCode && <Typography variant="small" color="red">{errorTypeCode}</Typography>}
                    </div>
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Tên nhóm đối tác *</Typography>
                        <Input
                            type="text"
                            value={editPartnerType.typeName}
                            onChange={(e) => {
                                setEditPartnerType({ ...editPartnerType, typeName: e.target.value });
                                setErrorTypeName(""); // Reset lỗi khi user nhập lại
                            }}
                            className="w-full"
                        />
                        {errorTypeName && <Typography variant="small" color="red">{errorTypeName}</Typography>}
                    </div>
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Trạng thái</Typography>
                        <Select
                            value={editPartnerType.status ? "active" : "inactive"}
                            onChange={(value) => setEditPartnerType({ ...editPartnerType, status: value === "active" })}
                            className="w-full"
                        >
                            <Option value="active">Đang hoạt động</Option>
                            <Option value="inactive">Ngừng hoạt động</Option>
                        </Select>
                    </div>
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Mô tả</Typography>
                        <Textarea
                            type="text"
                            value={editPartnerType.description}
                            onChange={(e) => setEditPartnerType({ ...editPartnerType, description: e.target.value })}
                            className="w-full"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button color="gray" onClick={onClose}>Hủy</Button>
                    <Button color="blue" onClick={handleEditPartnerType}>Lưu</Button>
                </div>
            </div>
        </div>
    );
};

export default EditPartnerTypePopup;
