import React, { useState, useEffect } from "react";
import { createPartner, fetchPartnerTypes, getPartnerCodeByType } from "./partnerService";
import {
    Typography,
    Input,
    Button,
}
    from "@material-tailwind/react";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";

const CreatePartnerPopup = ({ onClose, onSuccess }) => {
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
            setPartnerTypes(
                data.map((pt) => ({ value: pt.typeId, label: pt.typeName }))
            );
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
                // Gọi API cho từng partnerTypeId và lấy danh sách mã
                const codes = await Promise.all(ids.map(id => getPartnerCodeByType(id)));
                setPartnerCodes(codes); // Lưu danh sách mã vào state
            } catch (error) {
                setPartnerCodes([]); // Nếu lỗi, xóa danh sách mã
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
                partnerCodes: partnerCodes, // ✅ Gửi danh sách mã đối tác
            };

            await createPartner(partnerData);
            onSuccess(); // Load lại danh sách sau khi tạo thành công
            onClose(); // Đóng popup
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] text-gray-900">
                <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6">Tạo đối tác mới</Typography>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
                </div>
                {errorMessage && <Typography variant="small" color="red" className="mb-4">{errorMessage}</Typography>}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Tên đối tác *</Typography>
                        <Input
                            type="text"
                            value={newPartner.partnerName}
                            onChange={(e) => {
                                setNewPartner({ ...newPartner, partnerName: e.target.value });
                                setErrorPartnerName(""); // Reset lỗi khi user nhập lại
                            }}
                            className="w-full"
                        />
                        {errorPartnerName && <Typography variant="small" color="red">{errorPartnerName}</Typography>}
                    </div>
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Nhóm đối tác</Typography>
                        <MultiSelectDropdown
                            options={partnerTypes}
                            selectedOptions={newPartner.partnerTypeIds}
                            setSelectedOptions={handlePartnerTypeChange}
                            setLabelString="- Chọn nhóm đối tác -"
                        />
                        {errorPartnerCodes && <Typography variant="small" color="red">{errorPartnerCodes}</Typography>}
                    </div>
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Mã đối tác</Typography>
                        <Input type="text"
                            value={partnerCodes.join(", ")} // Hiển thị tất cả mã, cách nhau bởi dấu phẩy
                            className="disabled:opacity-100"
                            disabled
                        />
                    </div>
                    <div className="col-span-1">
                        <Typography variant="small" className="mb-2">Email *</Typography>
                        <Input type="text" value={newPartner.email}
                            onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
                        />
                        {errorEmail && <Typography variant="small" color="red">{errorEmail}</Typography>}
                    </div>
                    <div className="col-span-1">
                        <Typography variant="small" className="mb-2">Số điện thoại *</Typography>
                        <Input type="text" value={newPartner.phone}
                            onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
                        />
                        {errorPhone && <Typography variant="small" color="red">{errorPhone}</Typography>}
                    </div>
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Địa chỉ *</Typography>
                        <Input type="text" value={newPartner.address}
                            onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })}
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button color="gray" onClick={onClose}>Hủy</Button>
                    <Button color="blue" onClick={handleCreatePartner}>Lưu</Button>
                </div>
            </div>
        </div>
    );
};

export default CreatePartnerPopup;
