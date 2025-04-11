import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Input,
    Button,
} from "@material-tailwind/react";
import { TextField, Divider, Button as MuiButton, IconButton } from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";

const EditProductTypePopUp = ({ productType, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        typeName: "",
        description: "",
    });
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (productType) {
            setFormData({
                typeName: productType.typeName,
                description: productType.description,
            });
        }
    }, [productType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/ProductType/${productType.typeId}`, formData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating product type:", error);
        }
    };

    return (
        <Dialog open={true} handler={onClose} size="md" className="px-4 py-2">
            {/* Header của Dialog */}
            <DialogHeader className="flex justify-between items-center pb-2">
                <Typography variant="h4" color="blue-gray">
                    Chỉnh sửa dòng sản phẩm
                </Typography>
                <IconButton
                    size="small"
                    onClick={onClose}
                >
                    <XMarkIcon className="h-5 w-5 stroke-2" />
                </IconButton>
            </DialogHeader>
            <Divider variant="middle" />
            {/* Body của Dialog */}
            <DialogBody className="space-y-4 pb-6 pt-6">
                {/* Tên dòng sản phẩm */}
                <div>
                    <Typography variant="medium" className="text-black">
                        Tên dòng sản phẩm
                        <span className="text-red-500"> *</span>
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        hiddenLabel
                        placeholder="Tên dòng sản phẩm"
                        color="success"
                        value={formData.typeName}
                        onChange={(e) =>
                            setFormData({ ...formData, typeName: e.target.value })
                        }
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
                        rows={3}
                        color="success"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    onClick={handleSubmit}
                >
                    Lưu
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default EditProductTypePopUp;
