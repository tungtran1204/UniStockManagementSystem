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
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Divider } from "@mui/material";

const CancelSaleOrderModal = ({ open, onClose, onConfirm }) => {
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        if (!reason.trim()) {
            alert("Vui lòng nhập lý do huỷ đơn hàng");
            return;
        }

        const confirmed = window.confirm("Bạn có chắc chắn muốn huỷ đơn hàng này? Việc hủy đơn hàng cũng sẽ hủy yêu cầu mua vật tư cho đơn hàng này");
        if (!confirmed) return;

        onConfirm(reason);
        onClose();
        setReason("");
    };

    const handleClose = () => {
        onClose();
        setReason("");
    };

    return (
        <Dialog open={open} handler={handleClose} size="md" className="px-4 py-2">
            <DialogHeader className="flex justify-between items-center pb-2">
                <Typography variant="h4" color="blue-gray">
                    Huỷ đơn hàng
                </Typography>
                <IconButton size="sm" variant="text" onClick={handleClose}>
                    <XMarkIcon className="h-5 w-5 stroke-2" />
                </IconButton>
            </DialogHeader>
            <Divider variant="middle" />
            <DialogBody className="space-y-4 pb-6 pt-6">
                <div>
                    <Typography variant="medium" className="text-black">
                        Lý do huỷ <span className="text-red-500">*</span>
                    </Typography>
                    <Textarea
                        label="Nhập lý do huỷ đơn hàng"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="min-h-[120px]"
                    />
                </div>
            </DialogBody>

            <DialogFooter className="pt-0">
                <Button color="red" variant="outlined" onClick={handleClose}>
                    Huỷ
                </Button>
                <Button
                    color="white"
                    variant="text"
                    className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 ml-3 rounded-[4px] transition-all duration-200 ease-in-out"
                    ripple={true}
                    onClick={handleConfirm}
                >
                    Xác nhận huỷ
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default CancelSaleOrderModal;
