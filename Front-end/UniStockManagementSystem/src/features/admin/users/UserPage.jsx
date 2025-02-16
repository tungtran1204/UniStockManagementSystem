import React, { useEffect } from "react";
import useUser from "./useUser";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
} from "@material-tailwind/react";
import { FaEye, FaTrashAlt } from "react-icons/fa";

const UserPage = () => {
  const { users, fetchUsers, deleteUser, toggleStatus } = useUser();

  useEffect(() => {
    fetchUsers().then((data) => {
      console.log("📢 API trả về danh sách Users:", data);
    });
  }, []);

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <Typography variant="h6" color="white">
            Danh sách người dùng
          </Typography>
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
                users.map(({ userId, email, roleNames, isActive }, key) => {
                  const className = `py-3 px-5 ${
                    key === users.length - 1 ? "" : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={userId}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Avatar src="/img/bruce-mars.jpeg" alt={email} size="sm" variant="rounded" />
                          <div>
                            <Typography
                              variant="small"
                              color="blue-gray"
                              className="font-semibold"
                            >
                              {email}
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
                        <Chip
                          variant="gradient"
                          color={isActive ? "green" : "blue-gray"}
                          value={isActive ? "Hoạt động" : "Vô hiệu hóa"}
                          className="py-0.5 px-2 text-[11px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Chỉnh sửa">
                            <button
                              onClick={() => console.log("Edit User:", userId)}
                              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <FaEye />
                            </button>
                          </Tooltip>
                          <Tooltip content="Xóa người dùng">
                            <button
                              onClick={() => deleteUser(userId)}
                              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                            >
                              <FaTrashAlt />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="border-b border-gray-200 px-3 py-4 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
};

export default UserPage;
