import React, { useState } from "react";
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
import { TextField, Button as MuiButton, Divider, FormControl, OutlinedInput, IconButton as MuiIconButton } from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePasswordModal = ({ open, onClose, onSave }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [errorCurrentPassword, setErrorCurrentPassword] = useState("");
    const [errorNewPassword, setErrorNewPassword] = useState("");
    const [errorConfirmPassword, setErrorConfirmPassword] = useState("");

    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const validatePassword = () => {
        let isValid = true;
        setError("");
        setErrorCurrentPassword("");
        setErrorNewPassword("");
        setErrorConfirmPassword("");

        if (!currentPassword.trim()) {
            setErrorCurrentPassword("Mật khẩu hiện tại không được để trống.");
            isValid = false;
        }

        if (!newPassword.trim()) {
            setErrorNewPassword("Mật khẩu mới không được để trống.");
            isValid = false;
        }

        if (!confirmPassword.trim()) {
            setErrorConfirmPassword("Nhập lại mật khẩu không được để trống.");
            isValid = false;
        }

        return isValid;
    };

    const handleSave = () => {
        if (!validatePassword()) return;

        if (newPassword !== confirmPassword) {
            setErrorConfirmPassword("Mật khẩu không trùng khớp.");
            return;
        }

        // Gọi API đổi mật khẩu ở đây nếu có
        onSave?.(currentPassword, newPassword);
        onClose();
    };

    return (
        <Dialog open={open} handler={onClose} size="sm" className="px-4 py-2">
            <DialogHeader className="flex justify-between items-center pb-2">
                <Typography variant="h4" color="blue-gray">
                    Đổi mật khẩu
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
            <DialogBody className="space-y-4 pb-6 pt-4">
                <div className="relative">
                    <Typography variant="medium" className="text-black">
                        Mật khẩu hiện tại
                        <span className="text-red-500"> *</span>
                    </Typography>
                    <div className="relative">
                        <TextField
                            fullWidth
                            size="small"
                            type={showCurrentPassword ? 'text' : 'password'}
                            hiddenLabel
                            placeholder="Mật khẩu hiện tại"
                            variant="outlined"
                            color="success"
                            value={currentPassword}
                            onChange={(e) => {
                                setCurrentPassword(e.target.value);
                                setErrorCurrentPassword("");
                            }}
                            error={Boolean(errorCurrentPassword)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                            {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                    {errorCurrentPassword &&
                        <Typography color="red" className="text-xs text-start mt-1">
                            {errorCurrentPassword}
                        </Typography>
                    }
                </div>

                <div className="relative">
                    <Typography variant="medium" className="text-black">
                        Mật khẩu mới
                        <span className="text-red-500"> *</span>
                    </Typography>
                    <div className="relative">
                        <TextField
                            fullWidth
                            size="small"
                            type={showNewPassword ? 'text' : 'password'}
                            hiddenLabel
                            placeholder="Mật khẩu mới"
                            variant="outlined"
                            color="success"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                setErrorNewPassword("")
                            }}
                            error={Boolean(errorNewPassword)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                            {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                    {errorNewPassword &&
                        <Typography color="red" className="text-xs text-start mt-1">
                            {errorNewPassword}
                        </Typography>
                    }
                </div>

                <div className="relative">
                    <Typography variant="medium" className="text-black">
                        Nhập lại mật khẩu mới
                        <span className="text-red-500"> *</span>
                    </Typography>
                    <div className="relative">
                        <TextField
                            fullWidth
                            size="small"
                            type={showConfirmPassword ? 'text' : 'password'}
                            hiddenLabel
                            placeholder="Nhập lại mật khẩu mới"
                            variant="outlined"
                            color="success"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                setErrorConfirmPassword("")
                            }}
                            error={Boolean(errorConfirmPassword)}
                        />
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>
                    {errorConfirmPassword &&
                        <Typography color="red" className="text-xs text-start mt-1">
                            {errorConfirmPassword}
                        </Typography>
                    }
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
                    onClick={handleSave}
                >
                    Lưu
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default ChangePasswordModal;
