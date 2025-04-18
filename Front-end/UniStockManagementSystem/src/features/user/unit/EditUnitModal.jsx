import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Button,
} from "@material-tailwind/react";
import { TextField, Divider, Button as MuiButton, IconButton } from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";

const EditUnitModal = ({ unit, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        unitName: "",
        status: true,
    });
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        if (unit) {
            setFormData({
                unitName: unit.unitName,
                status: unit.status,
            });
        }
    }, [unit]);

    const isEmptyOrWhitespace = (str) => !str || /^\s*$/.test(str);

    const handleUnitNameChange = (newName) => {
        setFormData({ ...formData, unitName: newName });
        if (!isEmptyOrWhitespace(newName)) {
            setValidationErrors((prev) => ({ ...prev, unitName: "" }));
        }
    };

    const handleSubmit = async () => {
        const newErrors = {};

        if (isEmptyOrWhitespace(formData.unitName)) {
            newErrors.unitName = "Tên đơn vị tính không được để trống hoặc chỉ chứa khoảng trắng!";
        }

        setValidationErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            try {
                await onSuccess(unit.id, formData);
                onClose();
            } catch (error) {
                console.error("Error updating unit:", error);
            }
        }
    };

    return (
        <Dialog open={true} handler={onClose} size="md" className="px-4 py-2">
            <DialogHeader className="flex justify-between items-center pb-2">
                <Typography variant="h4" color="blue-gray">
                    Chỉnh sửa đơn vị tính
                </Typography>
                <IconButton
                    size="small"
                    onClick={onClose}
                >
                    <XMarkIcon className="h-5 w-5 stroke-2" />
                </IconButton>
            </DialogHeader>
            <Divider variant="middle" />
            <DialogBody className="space-y-4 pb-6 pt-6">
                <div>
                    <Typography variant="medium" className="text-black">
                        Tên đơn vị tính
                        <span className="text-red-500"> *</span>
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        hiddenLabel
                        placeholder="Tên đơn vị tính"
                        color="success"
                        value={formData.unitName}
                        onChange={(e) => handleUnitNameChange(e.target.value)}
                    />
                    {validationErrors.unitName && (
                        <Typography variant="small" color="red">
                            {validationErrors.unitName}
                        </Typography>
                    )}
                </div>
            </DialogBody>
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

export default EditUnitModal;