import React, { useEffect } from "react";
import useUser from "./useUser";

const UserPage = () => {
  const { users, fetchUsers, deleteUser, toggleStatus } = useUser();

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Quản lý Users</h2>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.userId || user.id}>
                <td>{user.userId || user.id}</td>
                <td>{user.email}</td>
                <td>{user.roleName || "Không có vai trò"}</td>
                <td>
                  <button
                    className={`btn btn-sm ${
                      user.isActive ? "btn-success" : "btn-danger"
                    }`}
                    onClick={() => toggleStatus(user.userId, user.isActive)}
                  >
                    {user.isActive ? "🟢 Hoạt động" : "🔴 Vô hiệu hóa"}
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteUser(user.userId)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserPage;
