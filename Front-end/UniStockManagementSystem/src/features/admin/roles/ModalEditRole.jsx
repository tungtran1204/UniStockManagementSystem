import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Button,
  Switch,
} from "@material-tailwind/react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import usePermissions from "./usePermissions";

const ModalEditRole = ({
  open,
  onClose,
  role,
  allPermissions,
  rolePermissions = [], // ✅ Đảm bảo rolePermissions luôn có giá trị mặc định
  onUpdateRole,
}) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    console.log("🔍 [ModalEditRole] Role nhận được:", role);
    console.log("🔍 [ModalEditRole] Danh sách tất cả permissions:", allPermissions);
    console.log("🔍 [ModalEditRole] Permissions của role:", rolePermissions);

    if (role && allPermissions) {
      setRoleName(role.name || "");
      setDescription(role.description || "");
      setIsActive(role.active || false);

      // ✅ Nếu rolePermissions là undefined, gán mảng rỗng để tránh lỗi
      const selectedPerms = Array.isArray(rolePermissions) ? rolePermissions : [];
      setSelectedPermissions(selectedPerms);

      // ✅ Lọc ra các permission chưa được gán
      const selectedPermIds = selectedPerms.map((p) => p.id);
      const remainingPerms = allPermissions.filter((perm) => !selectedPermIds.includes(perm.id));
      setAvailablePermissions(remainingPerms);
    }
  }, [role, allPermissions, rolePermissions]);

  // Cập nhật vai trò khi bấm lưu
  const handleEditRole = () => {
    if (!roleName.trim()) {
      alert("Tên vai trò không được để trống!");
      return;
    }

    const updatedRole = {
      id: role.id,
      name: roleName,
      description,
      active: isActive,
      permissionIds: selectedPermissions.map((p) => p.id),
    };

    onUpdateRole(role.id, updatedRole);
    onClose();
  };

  // Cấm chỉnh sửa trạng thái của role ADMIN
  const isAdminRole = role?.name === "ADMIN";

  // Xử lý kéo thả giữa hai danh sách
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    let sourceList =
      source.droppableId === "availablePermissions"
        ? selectedPermissions
        : availablePermissions;

    let destinationList =
      destination.droppableId === "availablePermissions"
        ? selectedPermissions
        : availablePermissions;

    const [movedItem] = sourceList.splice(source.index, 1);
    destinationList.splice(destination.index, 0, movedItem);

    setAvailablePermissions([...availablePermissions]);
    setSelectedPermissions([...selectedPermissions]);
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
            disabled={isAdminRole}
            onChange={() => setIsActive(!isActive)}
          />
          <span>{isActive ? "Hoạt động" : "Vô hiệu hóa"}</span>
          {isAdminRole && (
            <span className="text-red-500 ml-2">Không thể chỉnh sửa ADMIN</span>
          )}
        </div>

        {/* Danh sách Permission (Drag & Drop) */}
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-2 gap-4">
            {/* Permission đã có */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">
                Permission có thể thêm:
              </h4>
              <Droppable droppableId="availablePermissions">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="border p-3 h-60 overflow-y-auto bg-gray-100 rounded-md"
                  >
                    {selectedPermissions.length === 0 ? (
                      <p className="text-gray-500">Chưa có quyền nào.</p>
                    ) : (
                      selectedPermissions.map((perm, index) => (
                        <Draggable
                          key={perm.id}
                          draggableId={perm.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-2 bg-white rounded-md shadow-md mb-2 cursor-pointer"
                            >
                              {perm.name}{" "}
                              <span className="text-gray-500">
                                ({perm.description})
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Permission có thể thêm */}
            <div>
              <h4 className="font-semibold mb-2 text-gray-700">
                Permission đã có:
              </h4>
              <Droppable droppableId="selectedPermissions">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="border p-3 h-60 overflow-y-auto bg-green-100 rounded-md"
                  >
                    {availablePermissions.length === 0 ? (
                      <p className="text-gray-500">Không có quyền nào.</p>
                    ) : (
                      availablePermissions.map((perm, index) => (
                        <Draggable
                          key={perm.id}
                          draggableId={perm.id.toString()}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="p-2 bg-white rounded-md shadow-md mb-2 cursor-pointer"
                            >
                              {perm.name}{" "}
                              <span className="text-gray-500">
                                ({perm.description})
                              </span>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>
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
