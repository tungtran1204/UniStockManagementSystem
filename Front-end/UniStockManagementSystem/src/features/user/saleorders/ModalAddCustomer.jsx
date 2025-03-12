import React, { useState } from "react";
import { Typography, Input, Button } from "@material-tailwind/react";
import { createPartner, getPartnerCodeByType } from "../partner/partnerService";

const ModalAddCustomer = ({ onClose, onSuccess }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [errorPartnerName, setErrorPartnerName] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [errorPhone, setErrorPhone] = useState("");

  const [newPartner, setNewPartner] = useState({
    partnerName: "",
    address: "",
    phone: "",
    email: "",
    // Không cho người dùng chọn partnerTypeIds, tự động dùng nhóm 1
  });

  const resetErrorMessages = () => {
    setErrorMessage("");
    setErrorPartnerName("");
    setErrorEmail("");
    setErrorPhone("");
  };

  const validatePartner = (partner) => {
    let isValid = true;
    resetErrorMessages();

    if (!partner.partnerName.trim()) {
      setErrorPartnerName("Tên đối tác không được để trống.");
      isValid = false;
    }
    if (!partner.email.trim()) {
      setErrorEmail("Email không được để trống.");
      isValid = false;
    }
    if (!partner.phone.trim()) {
      setErrorPhone("Số điện thoại không được để trống.");
      isValid = false;
    }
    return isValid;
  };

  const handleCreatePartner = async () => {
    if (!validatePartner(newPartner)) return;

    try {
      // Lấy partnerCode tự động cho nhóm đối tác = 1
      const code = await getPartnerCodeByType(1);
      console.log("Đã lấy partner code:", code);

      const partnerData = {
        partnerName: newPartner.partnerName,
        address: newPartner.address,
        phone: newPartner.phone,
        email: newPartner.email,
        // Gửi partnerCodes thay vì partnerTypeIds, vì backend yêu cầu partnerCodes
        partnerCodes: [code],
      };

      console.log("Payload gửi lên createPartner:", partnerData);
      // Nếu createPartner trả về đối tượng đã tạo, ta có thể dùng nó để cập nhật thông tin khách hàng
      const createdPartner = await createPartner(partnerData);
      // Gọi onSuccess với đối tượng partner vừa tạo để tự động điền vào phiếu order
      onSuccess(createdPartner);
      onClose(); // Đóng popup
    } catch (error) {
      console.error("Lỗi khi tạo đối tác:", error);
      if (error.response) {
        console.error("error.response.data:", error.response.data);
        console.error("error.response.status:", error.response.status);
      }
      if (error.response?.status === 409) {
        const errorCode = error.response.data;
        if (errorCode === "DUPLICATE_NAME") {
          setErrorPartnerName("Tên đối tác đã tồn tại.");
        }
      } else {
        alert("Lỗi khi tạo đối tác! Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] text-gray-900">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Tạo đối tác mới</Typography>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>
        {errorMessage && (
          <Typography variant="small" color="red" className="mb-4">
            {errorMessage}
          </Typography>
        )}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="col-span-2">
            <Typography variant="small" className="mb-2">
              Tên đối tác *
            </Typography>
            <Input
              type="text"
              value={newPartner.partnerName}
              onChange={(e) => {
                setNewPartner({ ...newPartner, partnerName: e.target.value });
                setErrorPartnerName("");
              }}
              className="w-full"
            />
            {errorPartnerName && (
              <Typography variant="small" color="red">
                {errorPartnerName}
              </Typography>
            )}
          </div>
          <div className="col-span-2">
            <Typography variant="small" className="mb-2">
              Địa chỉ *
            </Typography>
            <Input
              type="text"
              value={newPartner.address}
              onChange={(e) => setNewPartner({ ...newPartner, address: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="col-span-1">
            <Typography variant="small" className="mb-2">
              Email *
            </Typography>
            <Input
              type="text"
              value={newPartner.email}
              onChange={(e) => setNewPartner({ ...newPartner, email: e.target.value })}
            />
            {errorEmail && (
              <Typography variant="small" color="red">
                {errorEmail}
              </Typography>
            )}
          </div>
          <div className="col-span-1">
            <Typography variant="small" className="mb-2">
              Số điện thoại *
            </Typography>
            <Input
              type="text"
              value={newPartner.phone}
              onChange={(e) => setNewPartner({ ...newPartner, phone: e.target.value })}
            />
            {errorPhone && (
              <Typography variant="small" color="red">
                {errorPhone}
              </Typography>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button color="gray" onClick={onClose}>
            Hủy
          </Button>
          <Button color="blue" onClick={handleCreatePartner}>
            Lưu
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalAddCustomer;
