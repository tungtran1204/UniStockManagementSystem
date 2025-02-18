import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Select,
  Option,
  Switch,
} from "@material-tailwind/react";

const ModalAddUser = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("USER");
  const [isActive, setIsActive] = useState(true);

  const handleAddUser = () => {
    console.log("👤 Thêm người dùng:", { email, role, isActive });
    onClose(); // Đóng modal sau khi thêm
  };

  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>Thêm Người Dùng</DialogHeader>
      <DialogBody>
        <div className="flex flex-col gap-4">
          {/* ✅ Email */}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* ✅ Vai trò */}
          <Select label="Chọn vai trò" value={role} onChange={(value) => setRole(value)}>
            <Option value="USER">Người dùng</Option>
            <Option value="ADMIN">Quản trị viên</Option>
          </Select>

          {/* ✅ Trạng thái */}
          <div className="flex items-center gap-2">
            <Switch
              color="green"
              checked={isActive}
              onChange={() => setIsActive(!isActive)}
            />
            <span>{isActive ? "Hoạt động" : "Vô hiệu hóa"}</span>
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="gray" onClick={onClose}>
          Hủy
        </Button>
        <Button color="blue" onClick={handleAddUser}>
          Thêm
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalAddUser;
