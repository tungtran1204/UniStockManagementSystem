import React, { useEffect, useState } from "react";
import useWarehouse from "./useWarehouse";
import { updateWarehouseStatus, createWarehouse, fetchWarehouses } from "./warehouseService";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tooltip,
  Button,
  Input,
} from "@material-tailwind/react";
import { FaEdit, FaPlus } from "react-icons/fa";

const WarehousePage = () => {
  const { warehouses, fetchWarehouses } = useWarehouse();
  const navigate = useNavigate();
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [loading, setLoading] = useState(false);

  // State for new warehouse form
  const [newWarehouse, setNewWarehouse] = useState({
    warehouseCode: "",
    warehouseName: "",
    warehouseDescription: "",
    status: "",
  });

  useEffect(() => {
    fetchWarehouses();
  }, []);

  //update status of warehouse
  const handleUpdateStatus = async (warehouseId) => {
    if (window.confirm("Bạn có chắc chắn muốn thay đổi trạng thái kho này?")) {
      try {
        await updateWarehouseStatus(warehouseId);
        fetchWarehouses();
      } catch (error) {
        console.error("❌ Lỗi khi thay đổi trạng thái kho:", error);
      }
    }
  };

  //create new warehouse
  const handleCreateWarehouse = async () => {
    if (!newWarehouse.warehouseCode || !newWarehouse.warehouseName || !newWarehouse.status) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      await createWarehouse(newWarehouse);
      alert("Tạo kho thành công!");
      fetchWarehouses();
      setShowCreatePopup(false);
      setNewWarehouse({
        warehouseCode: "",
        warehouseName: "",
        description: "",
        status: "",
      });
    } catch (error) {
      console.error("Lỗi khi tạo kho:", error);
      alert("Lỗi khi tạo kho! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Render warehouse page
  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">
              Danh sách kho
            </Typography>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="white"
                variant="text"
                className="flex items-center gap-2"
                onClick={() => setShowCreatePopup(true)}
              >
                <FaPlus className="h-4 w-4" /> Thêm kho
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "STT",
                  "Mã kho",
                  "Tên kho",
                  "Trạng thái",
                  "Hành động",
                ].map((el) => (
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
              {warehouses.length > 0 ? (
                warehouses.map((warehouse, index) => {
                  const className = `py-3 px-5 ${index === warehouses.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                    }`;

                  return (
                    <tr key={warehouse.warehouseId}>
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {index + 1}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {warehouse.warehouseCode || "N/A"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {warehouse.warehouseName}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {warehouse.active || "N/A"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Chỉnh sửa">
                            <button
                              onClick={() =>
                                navigate(`/warehouses/edit/${warehouse.warehouseId}`)
                              }
                              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Thay đổi trạng thái">
                            <button
                              onClick={() => handleUpdateStatus(warehouse.warehouseId)}
                              className="p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white"
                            >
                              <FaEdit className="h-4 w-4" />
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
                    colSpan="6"
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

      {/* Popup tạo kho mới */}
      {showCreatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">Tạo kho mới</Typography>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowCreatePopup(false)}
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Typography variant="small" className="mb-2">Mã kho *</Typography>
                <Input
                  type="text"
                  value={newWarehouse.warehouseCode}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouseCode: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <Typography variant="small" className="mb-2">Tên kho *</Typography>
                <Input
                  type="text"
                  value={newWarehouse.warehouseName}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, warehouseName: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <Typography variant="small" className="mb-2">Mô tả</Typography>
                <Input
                  type="text"
                  value={newWarehouse.warehouseDescription}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, description: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <Typography variant="small" className="mb-2">Trạng thái *</Typography>
                <Input
                  type="text"
                  value={newWarehouse.active}
                  onChange={(e) => setNewWarehouse({ ...newWarehouse, status: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                color="gray"
                onClick={() => setShowCreatePopup(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                color="blue"
                onClick={handleCreateWarehouse}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Tạo kho"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousePage;