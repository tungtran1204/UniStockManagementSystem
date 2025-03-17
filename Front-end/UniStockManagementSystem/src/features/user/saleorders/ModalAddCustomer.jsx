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
import { TextField, MenuItem, Divider, FormControl, InputLabel, OutlinedInput, Chip, Select, Button as MuiButton } from "@mui/material";
import { XMarkIcon } from "@heroicons/react/24/outline";
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
    <Dialog open={true} handler={onClose} size="md" className="px-4 py-2">
      {/* Header của Dialog */}
      <DialogHeader className="flex justify-between items-center pb-2">
        <Typography variant="h4" color="blue-gray">
          Thêm đối tác khách hàng
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
            Tên khách hàng
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

export default ModalAddCustomer;
