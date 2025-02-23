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
  Input,
} from "@material-tailwind/react";
import { FaPlus, FaEdit, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import ModalAddUser from "./ModalAddUser"; // ✅ Import ModalAddUser
import ModalEditUser from "./ModalEditUser"; // ✅ Import ModalEditUser
import { getUserById } from "./userService";
import ReactPaginate from "react-paginate"; // ✅ Import ReactPaginate
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const UserPage = () => {
  const { users, fetchPaginatedUsers, toggleStatus, totalPages, totalElements } = useUser();
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 🟢 State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(0); // Trang hiện tại
  const [pageSize, setPageSize] = useState(5); // Số lượng user mỗi trang

  // 🟢 Fetch users khi mở trang hoặc chuyển trang
  useEffect(() => {
    fetchPaginatedUsers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const handleEditUser = async (user) => {
    try {
      const userData = await getUserById(user.userId);
      setSelectedUser(userData);
      setOpenEditModal(true);
    } catch (error) {
      console.error("❌ Lỗi khi lấy thông tin user:", error);
      alert("Không thể lấy thông tin user!");
    }
  };

  // 🟢 Xử lý chuyển trang
  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  // 🟢 Lọc người dùng theo từ khóa tìm kiếm
  const filteredUsers = users.filter(
    (user) =>
      (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          {/* Phần chọn số items/trang và tìm kiếm */}
          <div className="px-4 py-2 flex items-center gap-4">
  {/* Phần chọn số items/trang */}
  <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
    Hiển thị
  </Typography>
  <select
    value={pageSize}
    onChange={(e) => {
      setPageSize(Number(e.target.value));
      setCurrentPage(0);
    }}
    className="border rounded px-2 py-1"
  >
    {[5, 10, 20, 50].map((size) => (
      <option key={size} value={size}>
        {size}
      </option>
    ))}
  </select>
  <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
    người dùng mỗi trang
  </Typography>

  {/* Ô tìm kiếm nằm chung hàng */}
  <Input
    label="Tìm kiếm người dùng"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-64"
    containerProps={{ className: "w-64" }}
  />
</div>


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
              {filteredUsers.length > 0 ? (
                filteredUsers.map(({ userId, username, email, roleNames, isActive, phoneNumber, address, fullname, dateOfBirth, profilePicture }, key) => {
                  const className = `py-3 px-5 ${
                    key === filteredUsers.length - 1 ? "" : "border-b border-blue-gray-50"
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
                              {username}
                            </Typography>
                            <Typography variant="small" color="gray" className="text-xs">
                              {email}
                            </Typography>
                          </div>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {Array.isArray(roleNames) ? roleNames.filter(role => role !== "USER").join(", ") : roleNames}
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

        {/* 🟢 PHÂN TRANG */}
        <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <div className="flex items-center gap-2">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Trang {currentPage + 1} / {totalPages} • {totalElements} người dùng
            </Typography>
          </div>
          <ReactPaginate
            previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
            nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
            breakLabel="..."
            pageCount={totalPages}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageChange}
            containerClassName="flex items-center gap-1"
            pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
            pageLinkClassName="flex items-center justify-center w-full h-full"
            previousClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
            nextClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
            breakClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700"
            activeClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
            forcePage={currentPage}
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        </div>
      </Card>

      {/* ✅ Modal Thêm Người Dùng */}
      {openAddModal && <ModalAddUser open={openAddModal} onClose={() => setOpenAddModal(false)} fetchUsers={fetchPaginatedUsers} />}
      
      {/* ✅ Modal Chỉnh Sửa Người Dùng */}
      {openEditModal && <ModalEditUser open={openEditModal} onClose={() => setOpenEditModal(false)} user={selectedUser} fetchUsers={fetchPaginatedUsers} />}
    </div>
  );
};

export default UserPage;
