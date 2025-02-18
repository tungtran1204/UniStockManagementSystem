import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tooltip,
  Button,
  Switch,
} from "@material-tailwind/react";
import { FaTrashAlt, FaPlus, FaEdit } from "react-icons/fa";
import ModalAddRole from "./ModalAddRole"; // ✅ Import Modal thêm mới
import ModalEditRole from "./ModalEditRole"; // ✅ Import Modal chỉnh sửa
import useRole from "./useRole"; // ✅ Import custom hook

const RolePage = () => {
  // 🟢 Sử dụng hook `useRole` để quản lý state và gọi API
  const { roles, loading, handleAddRole, handleUpdateRole, handleToggleRoleStatus, handleDeleteRole } = useRole();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null); // 🟢 Lưu role cần chỉnh sửa

  // 🔹 Mở Modal chỉnh sửa và set dữ liệu
  const handleEditRole = (role) => {
    setSelectedRole(role);
    setOpenEditModal(true);
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6 flex justify-between items-center">
          <Typography variant="h6" color="white">Danh sách Vai Trò</Typography>
          <Button
  size="sm"
  color="white"
  variant="text"
  className="flex items-center gap-2"
  onClick={() => setOpenAddModal(true)}
>
  <FaPlus className="h-4 w-4" /> Thêm Vai Trò
</Button>

        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {loading ? (
            <Typography className="text-center">Đang tải...</Typography>
          ) : (
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Tên Vai Trò", "Mô Tả", "Trạng Thái", "Hành Động"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <tr key={role.id}>
                      <td className="py-3 px-5">{role.name}</td>
                      <td className="py-3 px-5">{role.description}</td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <Switch color="green" checked={role.active} onChange={() => handleToggleRoleStatus(role.id, role.active)} />
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {role.active ? "Hoạt động" : "Vô hiệu hóa"}
                          </Typography>
                        </div>
                      </td>
                      <td className="py-3 px-5 flex gap-2">
                        <Tooltip content="Chỉnh sửa">
                          <button onClick={() => handleEditRole(role)} className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                            <FaEdit />
                          </button>
                        </Tooltip>
                       
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="border-b border-gray-200 px-3 py-4 text-center text-gray-500">Không có dữ liệu</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>

      {/* ✅ Modal Thêm Vai Trò */}
      <ModalAddRole open={openAddModal} onClose={() => setOpenAddModal(false)} onAddRole={handleAddRole} />

      {/* ✅ Modal Chỉnh Sửa Vai Trò */}
      {selectedRole && (
        <ModalEditRole
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          role={selectedRole}
          onUpdateRole={handleUpdateRole}
        />
      )}
    </div>
  );
};

export default RolePage;
