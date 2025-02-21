import React, { useEffect, useState } from "react";
import useUser from "./useUser";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Switch,
  Tooltip,
  Button,
} from "@material-tailwind/react";
import { FaPlus, FaEdit } from "react-icons/fa";
import ModalAddUser from "./ModalAddUser"; // ✅ Import ModalAddUser
import ModalEditUser from "./ModalEditUser"; // ✅ Import ModalEditUser
import { getUserById } from "./userService";

const UserPage = () => {
  const { users, fetchUsers, toggleStatus } = useUser();
  const [openAddModal, setOpenAddModal] = useState(false); // ✅ State quản lý ModalAddUser
  const [openEditModal, setOpenEditModal] = useState(false); // ✅ State quản lý ModalEditUser
  const [selectedUser, setSelectedUser] = useState(null); // ✅ State quản lý user được chọn để chỉnh sửa

  useEffect(() => {
    fetchUsers().then((data) => {
      console.log("📢 API trả về danh sách Users:", data);
    });
  }, []);

  const handleEditUser = async (user) => {
    try {
      const userData = await getUserById(user.userId); // 🟢 Fetch đầy đủ user
      setSelectedUser(userData);
      setOpenEditModal(true);
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông tin user:", error);
      alert("Không thể lấy thông tin user!");
    }
};

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Danh sách người dùng
          </Typography>

          {/* ✅ Nút mở ModalAddUser */}
          {/* <Button
            color="light-blue"
            className="flex items-center gap-2"
            onClick={() => setOpenAddModal(true)} // ✅ Sửa lỗi mở modal
          >
            <FaPlus className="text-white" />
            Thêm Người Dùng
          </Button> */}
          <Button
                        size="sm"
                        color="white"
                        variant="text"
                        className="flex items-center gap-2"
                        onClick={() => setOpenAddModal(true)}
                      >
                        <FaPlus className="h-4 w-4" /> Thêm Người Dùng
                      </Button>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["User", "Chức vụ", "Trạng thái", "Hành động"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map(({ userId, username, email, roleNames, isActive, phoneNumber, address, fullname, dateOfBirth, profilePicture }, key) => {
                  const className = `py-3 px-5 ${
                    key === users.length - 1 ? "" : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={userId}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Avatar src={profilePicture || "/img/bruce-mars.jpeg"} alt={email} size="sm" variant="rounded" />
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {username} {/* 🟢 Hiển thị username */}
                            </Typography>
                            <Typography variant="small" color="gray" className="text-xs">
                              {email} {/* 🟢 Hiển thị email phía dưới */}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {Array.isArray(roleNames) ? roleNames.join(", ") : roleNames}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Switch
                            color="green"
                            checked={isActive}
                            onChange={() => {
                              if (!roleNames.includes("ADMIN")) {
                                toggleStatus(userId, isActive);
                              }
                            }}
                            disabled={roleNames.includes("ADMIN")}
                          />
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {isActive ? "Hoạt động" : "Vô hiệu hóa"}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Chỉnh sửa">
                            <button
                              onClick={() => handleEditUser({ userId, username, email, roleNames, isActive, phoneNumber, address, fullname, dateOfBirth, profilePicture })}
                              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <FaEdit />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="border-b border-gray-200 px-3 py-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* ✅ Modal Thêm Người Dùng */}
      {openAddModal && <ModalAddUser open={openAddModal} onClose={() => setOpenAddModal(false)} fetchUsers={fetchUsers} />}
      
      {/* ✅ Modal Chỉnh Sửa Người Dùng */}
      {openEditModal && <ModalEditUser open={openEditModal} onClose={() => setOpenEditModal(false)} user={selectedUser} fetchUsers={fetchUsers} />}
    </div>
  );
};

export default UserPage;
