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
import { FaPlus, FaEdit } from "react-icons/fa";
import ModalAddUser from "./ModalAddUser";
import ModalEditUser from "./ModalEditUser";
import { getUserById } from "./userService";
import ReactPaginate from "react-paginate";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';

const UserPage = () => {
  const {
    users,
    fetchPaginatedUsers,
    toggleStatus,
    totalPages,
    totalElements,
  } = useUser();

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State quản lý phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Mỗi lần currentPage hoặc pageSize đổi => fetch lại
  useEffect(() => {
    fetchPaginatedUsers(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Mở modal sửa và lấy user chi tiết
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

  // Xử lý đổi trang
  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  // Lọc user theo searchTerm
  const filteredUsers = users.filter(
    (user) =>
      (user.username &&
        user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="mb-8 flex flex-col gap-12">
      <Card className="bg-gray-100 p-7">
        <PageHeader
          title="Danh sách Người Dùng"
          addButtonLabel="Thêm người dùng"
          onAdd={() => setOpenAddModal(true)}
          showImport={false}
          showExport={false}
        />

        <CardBody className="pb-2 bg-white rounded-xl overflow-x-auto">
          {/* Chọn số items/trang + Tìm kiếm */}
          <div className="px-4 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Typography
                variant="small"
                color="blue-gray"
                className="font-light"
              >
                Hiển thị
              </Typography>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="border text-sm rounded px-2 py-1"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal"
              >
                bản ghi mỗi trang
              </Typography>
            </div>
            <TableSearch
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={() => {
                // Thêm hàm xử lý tìm kiếm vào đây nếu có
                console.log("Tìm kiếm người dùng:", searchTerm);
              }}
              placeholder="Tìm kiếm người dùng"
            />

          </div>

          {/* Bảng danh sách user */}
          <table className="w-full min-w-[640px] table-auto border border-gray-200">
            <thead>
              <tr>
                {["STT", "Người dùng", "Vai trò", "Trạng thái", "Hành động"].map(
                  (el) => (
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
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(
                  (
                    {
                      userId,
                      username,
                      email,
                      roleNames,
                      isActive,
                      phoneNumber,
                      address,
                      fullname,
                      dateOfBirth,
                      profilePicture,
                    },
                    index
                  ) => {
                    // Tính lớp CSS dòng
                    const isLast = index === filteredUsers.length - 1;
                    const className = `py-3 px-5 ${isLast ? "" : "border-b border-blue-gray-50"
                      }`;

                    // Tính STT: offset = currentPage * pageSize
                    const stt = currentPage * pageSize + (index + 1);

                    return (
                      <tr key={userId}>
                        <td className={className}>
                          <Typography
                            variant="small"
                            color="blue-gray"
                            className="font-semibold"
                          >
                            {stt}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-4">
                            <Avatar
                              src={profilePicture || "/img/bruce-mars.jpeg"}
                              alt={email}
                              size="sm"
                              variant="rounded"
                            />
                            <div>
                              <Typography
                                variant="small"
                                color="blue-gray"
                                className="font-semibold"
                              >
                                {username}
                              </Typography>
                              <Typography
                                variant="small"
                                color="gray"
                                className="text-xs"
                              >
                                {email}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td className={className}>
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {Array.isArray(roleNames)
                              ? roleNames
                                .filter((role) => role !== "USER")
                                .join(", ")
                              : roleNames}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-2">
                            <Switch
                              color="green"
                              checked={isActive}
                              onChange={() => {
                                // Không cho tắt/mở ADMIN
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
                              <span
                                onClick={() =>
                                  handleEditUser({
                                    userId,
                                    username,
                                    email,
                                    roleNames,
                                    isActive,
                                    phoneNumber,
                                    address,
                                    fullname,
                                    dateOfBirth,
                                    profilePicture,
                                  })
                                }
                                className="cursor-pointer text-m text-blue-500 hover:text-blue-600"
                              >
                                Xem
                              </span>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              ) : (
                <tr>
                  {/* Do có 5 cột (STT + 4), colSpan = 5 */}
                  <td
                    colSpan="5"
                    className="border-b border-gray-200 px-3 py-4 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* PHÂN TRANG */}
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
        </CardBody>
      </Card>

      {/* Modal Thêm Người Dùng */}
      {openAddModal && (
        <ModalAddUser
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          fetchUsers={fetchPaginatedUsers}
        />
      )}

      {/* Modal Chỉnh Sửa Người Dùng */}
      {openEditModal && (
        <ModalEditUser
          open={openEditModal}
          onClose={() => setOpenEditModal(false)}
          user={selectedUser}
          fetchUsers={fetchPaginatedUsers}
        />
      )}
    </div>
  );
};

export default UserPage;
