import React, { useState } from "react";
import { createPartnerType } from "./partnerTypeService";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Input,
    Button,
    IconButton,
} from "@material-tailwind/react";
import {
    TextField,
    Divider,
    Button as MuiButton
} from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";

const CreatePartnerTypePopup = ({ onClose, onSuccess }) => {
    const [newPartnerType, setNewPartnerType] = useState({
        typeCode: "",
        typeName: "",
        status: true,
        description: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [errorTypeCode, setErrorTypeCode] = useState("");
    const [errorTypeName, setErrorTypeName] = useState("");

    const resetErrorMessages = () => {
        setErrorMessage("");
        setErrorTypeCode("");
        setErrorTypeName("");
    };

    const validatePartnerType = (partnerType) => {
        let isValid = true;
        resetErrorMessages();

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

    const handleCreatePartnerType = async () => {
        if (!validatePartnerType(newPartnerType)) return;

        try {
            await createPartnerType(newPartnerType);
            onSuccess(); // Load lại danh sách sau khi tạo thành công
            onClose(); // Đóng popup
        } catch (error) {
            console.error("Lỗi khi tạo nhóm đối tác:", error);
            if (error.response?.status === 409) {
                const errorCode = error.response.data;
                if (errorCode === "DUPLICATE_CODE_AND_NAME") {
                    setErrorMessage("Mã và tên nhóm đối tác đã tồn tại.");
                } else if (errorCode === "DUPLICATE_CODE") {
                    setErrorTypeCode("Mã nhóm đối tác đã tồn tại.");
                } else if (errorCode === "DUPLICATE_NAME") {
                    setErrorTypeName("Tên nhóm đối tác đã tồn tại.");
                }
            } else {
                alert("Lỗi khi tạo nhóm đối tác! Vui lòng thử lại.");
            }
        }
    };

    return (
        <Dialog open={true} handler={onClose} size="md" className="px-4 py-2">
            {/* Header của Dialog */}
            <DialogHeader className="flex justify-between items-center pb-2">
                <Typography variant="h4" color="blue-gray">
                    Thêm nhóm đối tác
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
                {errorMessage && <Typography variant="small" color="red" className="mb-4">{errorMessage}</Typography>}

                {/* Mã nhóm đối tác */}
                <div>
                    <Typography variant="medium" className="text-black">
                        Mã nhóm đối tác
                        <span className="text-red-500"> *</span>
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        hiddenLabel
                        placeholder="Mã nhóm đối tác"
                        color="success"
                        value={newPartnerType.typeCode}
                        onChange={(e) => setNewPartnerType({ ...newPartnerType, typeCode: e.target.value })}
                    />
                    {errorTypeCode && <Typography variant="small" color="red">{errorTypeCode}</Typography>}
                </div>

                <div>
                    <Typography variant="medium" className="text-black">
                        Tên nhóm đối tác
                        <span className="text-red-500"> *</span>
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        hiddenLabel
                        placeholder="Tên nhóm đối tác"
                        variant="outlined"
                        color="success"
                        value={newPartnerType.typeName}
                        onChange={(e) => setNewPartnerType({ ...newPartnerType, typeName: e.target.value })}
                    />
                </div>

                {/* Mô tả */}
                <div>
                    <Typography variant="medium" className="text-black">
                        Mô tả
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        hiddenLabel
                        placeholder="Mô tả"
                        variant="outlined"
                        multiline
                        rows={4}
                        color="success"
                        value={newPartnerType.description}
                        onChange={(e) => setNewPartnerType({ ...newPartnerType, description: e.target.value })}
                    />
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
                    onClick={handleCreatePartnerType}
                >
                    Lưu
                </Button>
            </DialogFooter>
        </Dialog>
        // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        //     <div className="bg-white rounded-lg p-6 w-[500px]">
        //         <div className="flex justify-between items-center mb-4">
        //             <Typography variant="h6">Tạo nhóm đối tác mới</Typography>
        //             <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        //         </div>
        //         {errorMessage && <Typography variant="small" color="red" className="mb-4">{errorMessage}</Typography>}
        //         <div className="grid grid-cols-2 gap-4 mb-4">
        //             <div className="col-span-2">
        //                 <Typography variant="small" className="mb-2">Mã nhóm đối tác *</Typography>
        //                 <Input
        //                     type="text"
        //                     value={newPartnerType.typeCode}
        //                     onChange={(e) => {
        //                         setNewPartnerType({ ...newPartnerType, typeCode: e.target.value });
        //                         setErrorTypeCode(""); // Reset lỗi khi user nhập lại
        //                     }}
        //                     className="w-full"
        //                 />
        //                 {errorTypeCode && <Typography variant="small" color="red">{errorTypeCode}</Typography>}
        //             </div>
        //             <div className="col-span-2">
        //                 <Typography variant="small" className="mb-2">Tên nhóm đối tác *</Typography>
        //                 <Input
        //                     type="text"
        //                     value={newPartnerType.typeName}
        //                     onChange={(e) => {
        //                         setNewPartnerType({ ...newPartnerType, typeName: e.target.value });
        //                         setErrorTypeName(""); // Reset lỗi khi user nhập lại
        //                     }}
        //                     className="w-full"
        //                 />
        //                 {errorTypeName && <Typography variant="small" color="red">{errorTypeName}</Typography>}
        //             </div>
        //             <div className="col-span-2">
        //                 <Typography variant="small" className="mb-2">Mô tả</Typography>
        //                 <Textarea
        //                     type="text"
        //                     value={newPartnerType.description}
        //                     onChange={(e) => setNewPartnerType({ ...newPartnerType, description: e.target.value })}
        //                     className="w-full"
        //                 />
        //             </div>
        //         </div>
        //         <div className="flex justify-end gap-2">
        //             <Button color="gray" onClick={onClose}>Hủy</Button>
        //             <Button color="blue" onClick={handleCreatePartnerType}>Lưu</Button>
        //         </div>
        //     </div>
        // </div>
    );
};

export default CreatePartnerTypePopup;
