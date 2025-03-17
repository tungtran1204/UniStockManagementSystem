import React, { useState, useEffect } from "react";
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
import { TextField, MenuItem, Divider, FormControl, InputLabel, OutlinedInput, Chip, Select, Button as MuiButton } from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { createPartner, fetchPartnerTypes, getPartnerCodeByType } from "./partnerService";

const CreatePartnerModal = ({ onClose, onSuccess }) => {
    const [partnerTypes, setPartnerTypes] = useState([]);
    const [partnerCodes, setPartnerCodes] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [errorPartnerName, setErrorPartnerName] = useState("");
    const [errorPartnerCodes, setErrorPartnerCodes] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorPhone, setErrorPhone] = useState("");

    const [newPartner, setNewPartner] = useState({
        partnerName: "",
        address: "",
        phone: "",
        email: "",
        partnerTypeIds: [],
    });

    useEffect(() => {
        const loadPartnerTypes = async () => {
            const data = await fetchPartnerTypes();
            setPartnerTypes(data.map((pt) => ({ value: pt.typeId, label: pt.typeName })));
        };
        loadPartnerTypes();
    }, []);

    const resetErrorMessages = () => {
        setErrorMessage("");
        setErrorPartnerName("");
    };

    const validatePartner = (partner) => {
        let isValid = true;
        resetErrorMessages();

        if (!partner.partnerName.trim()) {
            setErrorPartnerName("Tên đối tác không được để trống.");
            isValid = false;
        }

        if (partnerCodes.length === 0) {
            setErrorPartnerCodes("Hãy chọn ít nhất một mã đối tác.");
            isValid = false;
        }

        return isValid;
    };

    const handlePartnerTypeChange = async (ids) => {
        setErrorPartnerCodes("");
        setNewPartner({ ...newPartner, partnerTypeIds: ids });

        if (ids.length > 0) {
            try {
                const codes = await Promise.all(ids.map(id => getPartnerCodeByType(id)));
                setPartnerCodes(codes);
            } catch (error) {
                setPartnerCodes([]);
            }
        } else {
            setPartnerCodes([]);
        }
    };

    const handleCreatePartner = async () => {
        if (!validatePartner(newPartner)) return;

        try {
            const partnerData = {
                partnerName: newPartner.partnerName,
                address: newPartner.address,
                phone: newPartner.phone,
                email: newPartner.email,
                partnerCodes: partnerCodes,
            };

            await createPartner(partnerData);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi khi tạo đối tác:", error);
            if (error.response?.status === 409) {
                const errorCode = error.response.data;
                if (errorCode === "DUPLICATE_NAME") {
                    setErrorPartnerName("Tên đối tác đã tồn tại.");
                } else if (errorCode === "NO_PARTNER_TYPE") {
                    setErrorPartnerCodes("Hãy chọn ít nhất một nhóm đối tác.");
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
                    Thêm đối tác
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

                {/* Tên đối tác */}
                <div>
                    <Typography variant="medium" className="text-black">
                        Tên đối tác
                        <span className="text-red-500"> *</span>
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        hiddenLabel
                        placeholder="Tên đối tác"
                        color="success"
                        value={newPartner.partnerName}
                        onChange={(e) => setNewPartner({ ...newPartner, partnerName: e.target.value })}
                    />
                    {errorPartnerName && <Typography variant="small" color="red">{errorPartnerName}</Typography>}
                </div>

                {/* Nhóm đối tác */}
                <div>
                    <Typography variant="medium" className="text-black">
                        Nhóm đối tác
                        <span className="text-red-500"> *</span>
                    </Typography>
                    <MultiSelectDropdown
                        options={partnerTypes}
                        selectedOptions={newPartner.partnerTypeIds}
                        setSelectedOptions={handlePartnerTypeChange}
                        setLabelString="Chọn nhóm đối tác"
                        error={errorPartnerCodes}
                    />
                </div>

                {/* Mã đối tác */}
                <div>
                    <Typography variant="medium" className="text-black">
                        Mã đối tác
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        hiddenLabel
                        placeholder="Mã đối tác"
                        variant="outlined"
                        color="success"
                        value={partnerCodes.join(", ")}
                        disabled
                    />
                </div>

                <div>
                    <Typography variant="medium" className="text-black">
                        Người liên hệ
                        <span className="text-red-500"> *</span>
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        hiddenLabel
                        placeholder="Người liên hệ"
                        variant="outlined"
                        color="success"
                    // value={newPartner.email}
                    // onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                    // error={!!errorEmail}
                    // helperText={errorEmail}
                    />
                </div>

                {/* Email & Số điện thoại */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Typography variant="medium" className="text-black">Email</Typography>
                        <TextField
                            fullWidth
                            size="small"
                            hiddenLabel
                            placeholder="Email"
                            variant="outlined"
                            color="success"
                            value={newPartner.email}
                            onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                            error={!!errorEmail}
                            helperText={errorEmail}
                        />
                    </div>
                    <div>
                        <Typography variant="medium" className="text-black">
                            Số điện thoại
                            <span className="text-red-500"> *</span>
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            hiddenLabel
                            placeholder="Số điện thoại"
                            variant="outlined"
                            color="success"
                            value={newPartner.phone}
                            onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                            error={!!errorPhone}
                            helperText={errorPhone}
                        />
                    </div>
                </div>

                {/* Địa chỉ */}
                <div>
                    <Typography variant="medium" className="text-black">
                        Địa chỉ
                        <span className="text-red-500"> *</span>
                    </Typography>
                    <TextField
                        fullWidth
                        size="small"
                        hiddenLabel
                        placeholder="Địa chỉ"
                        variant="outlined"
                        multiline
                        maxRows={2}
                        color="success"
                        value={newPartner.address}
                        onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })}
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
                    onClick={handleCreatePartner}
                >
                    Lưu
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default CreatePartnerModal;
