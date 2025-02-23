import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogBody, DialogFooter, Input, Button, Switch } from "@material-tailwind/react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

const ModalAddRole = ({ open, onClose, onAddRole, availablePermissions = [] }) => {
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [remainingPermissions, setRemainingPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  useEffect(() => {
    if (open) {
      setRemainingPermissions(availablePermissions || []);
      setSelectedPermissions([]);
    }
  }, [open, availablePermissions]);

  // 🏗 Xử lý kéo thả
  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) return;

    if (source.droppableId === "remainingPermissions") {
      const movedPermission = remainingPermissions[source.index];
      setRemainingPermissions((prev) => prev.filter((_, idx) => idx !== source.index));
      setSelectedPermissions((prev) => [...prev, movedPermission]);
    } else {
      const movedPermission = selectedPermissions[source.index];
      setSelectedPermissions((prev) => prev.filter((_, idx) => idx !== source.index));
      setRemainingPermissions((prev) => [...prev, movedPermission]);
    }
  };

  const handleAddRole = () => {
    if (!roleName.trim()) {
      alert("Tên vai trò không được để trống!");
      return;
    }

    onAddRole({ name: roleName, description, active: isActive, permissions: selectedPermissions });
    onClose();
  };

  return (
    <Dialog open={open} handler={onClose}>
      <DialogHeader>Thêm Vai Trò</DialogHeader>
      <DialogBody>
        <Input label="Tên Vai Trò" value={roleName} onChange={(e) => setRoleName(e.target.value)} required />
        <Input label="Mô Tả" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Switch color="green" checked={isActive} onChange={() => setIsActive(!isActive)} label="Kích hoạt" />

        {/* 🏗 Khu vực kéo thả */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 mt-4">
            {/* 🔹 Danh sách permission chưa có */}
            <Droppable droppableId="remainingPermissions">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="w-1/2 border p-2 rounded-md bg-gray-100 min-h-[150px]">
                  <p className="text-sm font-bold mb-2">Permission có thể thêm</p>
                  {(remainingPermissions || []).length > 0 ? (
                    remainingPermissions.map((perm, index) => (
                      <Draggable key={perm} draggableId={perm} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-2 mb-2 rounded shadow cursor-pointer"
                          >
                            {perm}
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center">Không còn permission</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* 🔹 Danh sách permission đã chọn */}
            <Droppable droppableId="selectedPermissions">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="w-1/2 border p-2 rounded-md bg-gray-100 min-h-[150px]">
                  <p className="text-sm font-bold mb-2">Permission đã chọn</p>
                  {(selectedPermissions || []).length > 0 ? (
                    selectedPermissions.map((perm, index) => (
                      <Draggable key={perm} draggableId={perm} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-blue-100 p-2 mb-2 rounded shadow cursor-pointer"
                          >
                            {perm}
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center">Chưa có permission</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </DialogBody>

      <DialogFooter>
        <Button variant="text" color="gray" onClick={onClose}>Hủy</Button>
        <Button color="blue" onClick={handleAddRole}>Thêm</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalAddRole;
