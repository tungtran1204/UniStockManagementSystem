import React, { useState, useEffect } from "react";
import { updatePartner, fetchPartnerTypes } from "./partnerService";
import { Typography, Input, Button } from "@material-tailwind/react";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";

const EditPartnerModal = ({ partner, onClose, onSuccess }) => {
    const [partnerTypes, setPartnerTypes] = useState([]);
    const [errorPartnerName, setErrorPartnerName] = useState("");
    const [errorEmail, setErrorEmail] = useState("");
    const [errorPhone, setErrorPhone] = useState("");

    // State lưu thông tin chỉnh sửa
    const [editPartner, setEditPartner] = useState({
        partnerName: "",
        address: "",
        phone: "",
        email: "",
        partnerTypeIds: [],
        partnerCodes: [],
    });

    useEffect(() => {
        // Tải danh sách nhóm đối tác
        const loadPartnerTypes = async () => {
            const data = await fetchPartnerTypes();
            setPartnerTypes(
                data.map((pt) => ({
                    value: pt.typeId,
                    label: pt.typeName
                }))
            );
        };
        loadPartnerTypes();
        
        // Gán thông tin đối tác vào form khi mở modal
        if (partner) {
            setEditPartner({
                partnerName: partner.partnerName || "",
                address: partner.address || "",
                phone: partner.phone || "",
                email: partner.email || "",
                partnerTypeIds: partner.partnerTypes
                    ? partner.partnerTypes.map(pt => pt.partnerType.typeName)
                    : [],
                partnerCodes: partner.partnerTypes
                    ? partner.partnerTypes.map(pt => pt.partnerCode)
                    : [],
            });
        }
        console.log("editpartner: ", partner);
    }, [partner]);

    const validatePartner = () => {
        let isValid = true;
        setErrorPartnerName("");
        setErrorEmail("");
        setErrorPhone("");

        if (!editPartner.partnerName.trim()) {
            setErrorPartnerName("Tên đối tác không được để trống.");
            isValid = false;
        }
        return isValid;
    };

    const handleUpdatePartner = async () => {
        if (!validatePartner()) return;

        try {
            const updatedData = {
                partnerId: partner.partnerId,
                partnerName: editPartner.partnerName,
                address: editPartner.address,
                phone: editPartner.phone,
                email: editPartner.email,
                partnerCodes: editPartner.partnerCodes,
                partnerTypeIds: editPartner.partnerTypeIds,
            };

            await updatePartner(updatedData);
            onSuccess(); // Reload danh sách sau khi cập nhật
            onClose(); // Đóng modal
        } catch (error) {
            console.error("Lỗi khi cập nhật đối tác:", error);
            alert("Có lỗi xảy ra! Vui lòng thử lại.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] text-gray-900">
                <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6">Chỉnh sửa đối tác</Typography>
                    <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
                </div>

                {/* Form chỉnh sửa */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Tên đối tác *</Typography>
                        <Input
                            type="text"
                            value={editPartner.partnerName}
                            onChange={(e) => setEditPartner({ ...editPartner, partnerName: e.target.value })}
                            className="w-full"
                        />
                        {errorPartnerName && <Typography variant="small" color="red">{errorPartnerName}</Typography>}
                    </div>

                    {/* Nhóm đối tác */}
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Nhóm đối tác</Typography>
                        <MultiSelectDropdown
                            options={partnerTypes}
                            selectedOptions={editPartner.partnerTypeIds}
                            setSelectedOptions={(ids) => setEditPartner({ ...editPartner, partnerTypeIds: ids })}
                            setLabelString="- Chọn nhóm đối tác -"
                        />
                    </div>

                    {/* Mã đối tác */}
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Mã đối tác</Typography>
                        <Input
                            type="text"
                            value={editPartner.partnerCodes.join(", ")}
                            className="disabled:opacity-100"
                            disabled
                        />
                    </div>

                    {/* Email & Số điện thoại */}
                    <div className="col-span-1">
                        <Typography variant="small" className="mb-2">Email *</Typography>
                        <Input
                            type="text"
                            value={editPartner.email}
                            onChange={(e) => setEditPartner({ ...editPartner, email: e.target.value })}
                        />
                        {errorEmail && <Typography variant="small" color="red">{errorEmail}</Typography>}
                    </div>
                    <div className="col-span-1">
                        <Typography variant="small" className="mb-2">Số điện thoại *</Typography>
                        <Input
                            type="text"
                            value={editPartner.phone}
                            onChange={(e) => setEditPartner({ ...editPartner, phone: e.target.value })}
                        />
                        {errorPhone && <Typography variant="small" color="red">{errorPhone}</Typography>}
                    </div>

                    {/* Địa chỉ */}
                    <div className="col-span-2">
                        <Typography variant="small" className="mb-2">Địa chỉ *</Typography>
                        <Input
                            type="text"
                            value={editPartner.address}
                            onChange={(e) => setEditPartner({ ...editPartner, address: e.target.value })}
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                    <Button color="gray" onClick={onClose}>Hủy</Button>
                    <Button color="blue" onClick={handleUpdatePartner}>Lưu</Button>
                </div>
            </div>
        </div>
    );
};

export default EditPartnerModal;
