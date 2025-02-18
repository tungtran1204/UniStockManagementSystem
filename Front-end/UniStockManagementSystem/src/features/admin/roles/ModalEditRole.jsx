import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Switch
} from "@material-tailwind/react";

const ModalEditRole = ({
  open,
  onClose,
  role,
  allPermissions,      // 🟢 Tất cả permission (array)
  onUpdateRole
}) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState([]); 
  // 🟢 Lưu mảng id permission đang được chọn

  // 🔹 Cập nhật state khi `role` thay đổi
  useEffect(() => {
    if (role) {
      setRoleName(role.name || "");
      setDescription(role.description || "");
      setIsActive(role.active || false);

      // Lấy danh sách permission id đang có
      if (role.permissions) {
        const permIds = role.permissions.map((p) => p.id);
        setSelectedPermissions(permIds);
      } else {
        setSelectedPermissions([]);
      }
    }
  }, [role]);

  const handleEditRole = () => {
    if (!roleName.trim()) {
      alert("Tên vai trò không được để trống!");
      return;
    }

    // 🟢 Đóng gói dữ liệu
    const updatedRole = {
      id: role.id,
      name: roleName,
      description,
      active: isActive,
      permissionIds: selectedPermissions // 🟢 Mảng ID permission
    };

    onUpdateRole(role.id, updatedRole);
    onClose(); // ✅ Đóng modal sau khi cập nhật
  };

  // 🟢 Toggle checkbox
  const handleTogglePermission = (permId) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permId)) {
        // Bỏ đi
        return prev.filter((id) => id !== permId);
      } else {
        // Thêm vào
        return [...prev, permId];
      }
    });
  };

  return (
    <Dialog open={open} handler={onClose} size="lg">
      <DialogHeader>Chỉnh Sửa Vai Trò</DialogHeader>
      <DialogBody divider className="space-y-4">
        {/* Thông tin chung */}
        <Input
          label="Tên Vai Trò"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          required
        />
        <Input
          label="Mô Tả"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex items-center gap-2">
          <Switch
            color="green"
            checked={isActive}
            onChange={() => setIsActive(!isActive)}
          />
          <span>{isActive ? "Hoạt động" : "Vô hiệu hóa"}</span>
        </div>

        {/* Danh sách Permission */}
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Quyền (Permissions):</h4>
          {allPermissions && allPermissions.length > 0 ? (
            <div className="max-h-60 overflow-y-auto grid grid-cols-2 gap-2">
              {allPermissions.map((perm) => {
                const checked = selectedPermissions.includes(perm.id);
                return (
                  <label
                    key={perm.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleTogglePermission(perm.id)}
                    />
                    <span className="text-sm">
                      {perm.name}{" "}
                      <span className="text-gray-500">
                        ({perm.description})
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500">Không có permission nào.</p>
          )}
        </div>
      </DialogBody>

      <DialogFooter>
        <Button variant="text" color="gray" onClick={onClose}>
          Hủy
        </Button>
        <Button color="blue" onClick={handleEditRole}>
          Lưu
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalEditRole;
