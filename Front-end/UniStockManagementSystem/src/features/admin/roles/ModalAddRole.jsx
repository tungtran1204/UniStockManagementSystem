import React, { useState } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Switch } from "@material-tailwind/react";

const ModalAddRole = ({ open, onClose, onAddRole }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleAddRole = () => {
    if (!roleName.trim()) {
      alert("Tên vai trò không được để trống!");
      return;
    }
    onAddRole({ name: roleName, description, active: isActive });
    onClose();
  };

  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>Thêm Vai Trò</DialogHeader>
      <DialogBody>
        <Input label="Tên Vai Trò" value={roleName} onChange={(e) => setRoleName(e.target.value)} required />
        <Input label="Mô Tả" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Switch color="green" checked={isActive} onChange={() => setIsActive(!isActive)} />
      </DialogBody>
      <DialogFooter>
        <Button variant="text" color="gray" onClick={onClose}>Hủy</Button>
        <Button color="blue" onClick={handleAddRole}>Thêm</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalAddRole;
