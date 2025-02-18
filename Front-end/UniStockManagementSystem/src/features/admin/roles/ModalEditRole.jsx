import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Switch } from "@material-tailwind/react";

const ModalEditRole = ({ open, onClose, role, onUpdateRole }) => {
  const [roleName, setRoleName] = useState(role.name);
  const [description, setDescription] = useState(role.description);
  const [isActive, setIsActive] = useState(role.active);

  // 🔹 Cập nhật state khi `role` thay đổi
  useEffect(() => {
    if (role) {
      setRoleName(role.name);
      setDescription(role.description);
      setIsActive(role.active);
    }
  }, [role]);

  const handleEditRole = () => {
    if (!roleName.trim()) {
      alert("Tên vai trò không được để trống!");
      return;
    }

    const updatedRole = { id: role.id, name: roleName, description, active: isActive };
    onUpdateRole(role.id, updatedRole);
    onClose(); // ✅ Đóng modal sau khi cập nhật
  };

  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>Chỉnh Sửa Vai Trò</DialogHeader>
      <DialogBody>
        <Input label="Tên Vai Trò" value={roleName} onChange={(e) => setRoleName(e.target.value)} required />
        <Input label="Mô Tả" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="flex items-center gap-2 mt-4">
          <Switch color="green" checked={isActive} onChange={() => setIsActive(!isActive)} />
          <span>{isActive ? "Hoạt động" : "Vô hiệu hóa"}</span>
        </div>
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="gray" onClick={onClose}>Hủy</Button>
        <Button color="blue" onClick={handleEditRole}>Lưu</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalEditRole;
