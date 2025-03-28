import React, { useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Typography,
    Textarea,
    Button,
    IconButton,
    Select,
    Option,
} from "@material-tailwind/react";
import { Divider } from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";

const RejectPurchaseRequestModal = ({ show, handleClose, onConfirm }) => {
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (!reason.trim()) {
            alert("Vui lòng nhập lý do từ chối");
            return;
        }

        const confirmed = window.confirm("Bạn có chắc chắn muốn từ chối yêu cầu mua vật tư này?");
        if (!confirmed) return;

        onConfirm(reason);
        handleClose();
        setReason("");
    };

    if (!show) return null;

    return (
        <Dialog open={true} handler={handleClose} size="md" className="px-4 py-2">
            <DialogHeader className="flex justify-between items-center pb-2">
                <Typography variant="h4" color="blue-gray">
                    Từ chối yêu cầu mua vật tư
                </Typography>
                <IconButton size="sm" variant="text" onClick={handleClose}>
                    <XMarkIcon className="h-5 w-5 stroke-2" />
                </IconButton>
            </DialogHeader>
            <Divider variant="middle" />
            <DialogBody className="space-y-4 pb-6 pt-6">
                <div>
                    <Typography variant="medium" className="text-black">
                        Lý do từ chối <span className="text-red-500">*</span>
                    </Typography>
                    <Textarea
                        label="Nhập lý do từ chối"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[120px]"
                    />
                </div>
            </DialogBody>

            <DialogFooter className="pt-0">
                <Button color="red" variant="outlined" onClick={handleClose}>
                    Hủy
                </Button>
                <Button
                    color="white"
                    variant="text"
                    className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 ml-3 rounded-[4px] transition-all duration-200 ease-in-out"
                    ripple={true}
                    onClick={handleSubmit}
                >
                    Xác nhận từ chối
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default RejectPurchaseRequestModal;
