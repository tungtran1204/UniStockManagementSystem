import React, { useEffect, useState } from "react";
import usePartnerType from "./usePartnerType";
import {
  createPartnerType,
  updatePartnerType,
} from "./partnerTypeService";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Chip,
  Input,
  Textarea,
  Button,
  Tooltip,
  Select,
  Option,
} from "@material-tailwind/react";
import { FaEdit, FaPlus } from "react-icons/fa";

const PartnerTypePage = () => {
  const { partnerTypes, fetchPartnerTypes, toggleStatus } = usePartnerType();
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editPartnerType, setEditPartnerType] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // State cho form tạo nhóm đối tác mới
  const [newPartnerType, setNewPartnerType] = useState({
    typeCode: "",
    typeName: "",
    status: true,
    description: "",
  });

  useEffect(() => {
    fetchPartnerTypes().then((data) => {
      console.log("📢 API trả về danh sách Partner Types:", data);
    });
  }, []);

  const handleCreatePartnerType = async () => {
    if (!newPartnerType.typeCode || !newPartnerType.typeName) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      await createPartnerType(newPartnerType);
      fetchPartnerTypes();
      setShowCreatePopup(false);
      setNewPartnerType({
        typeCode: "",
        typeName: "",
        status: true,
        description: "",
      });
      setErrorMessage("");
    } catch (error) {
      console.error("Lỗi khi tạo nhóm đối tác:", error);
      if (error.response && error.response.status === 409) {
        setErrorMessage("Mã nhóm đối tác hoặc tên nhóm đối tác đã tồn tại.");
      } else {
        alert("Lỗi khi tạo nhóm đối tác! Vui lòng thử lại.");
      }
    }
  };

  const handleEditPartnerType = async () => {
    if (!editPartnerType.typeCode || !editPartnerType.typeName) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      await updatePartnerType(editPartnerType);
      fetchPartnerTypes();
      setShowEditPopup(false);
      setEditPartnerType(null);
      setErrorMessage("");
    } catch (error) {
      console.error("Lỗi khi cập nhật nhóm đối tác:", error);
      if (error.response && error.response.status === 409) {
        setErrorMessage("Mã nhóm đối tác hoặc tên nhóm đối tác đã tồn tại.");
      } else {
        alert("Lỗi khi cập nhật nhóm đối tác! Vui lòng thử lại.");
      }
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">
              Danh sách nhóm đối tác
            </Typography>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="white"
                variant="text"
                className="flex items-center gap-2"
                onClick={() => setShowCreatePopup(true)}
              >
                <FaPlus className="h-4 w-4" /> Thêm nhóm đối tác
              </Button>
              {/* <Button
                size="sm"
                color="white"
                variant="text"
                className="flex items-center gap-2"
                onClick={() => setShowImportPopup(true)}
              >
                <FaFileExcel className="h-4 w-4" /> Import Excel
              </Button>
              <Button
                size="sm"
                color="white"
                variant="text"
                className="flex items-center gap-2"
                onClick={exportExcel}
              >
                <FaFileExcel className="h-4 w-4" /> Export Excel
              </Button> */}
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["Mã nhóm đối tác", "Tên nhóm đối tác", "Mô tả", "Trạng thái", "Hành động"].map((el) => (
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
              {partnerTypes && partnerTypes.length > 0 ? (
                partnerTypes.map(({ typeId, typeCode, typeName, description, status }, key) => {
                  const className = `py-3 px-5 ${key === partnerTypes.length - 1 ? "" : "border-b border-blue-gray-50"
                    }`;

                  return (
                    <tr key={typeId}>
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {typeCode}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {typeName}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {description}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Chip
                            variant="gradient"
                            color={status ? "green" : "blue-gray"}
                            value={status ? "Đang hoạt động" : "Ngừng hoạt động"}
                            className="py-1 px-2 text-[11px] font-medium w-fit rounded-full"
                          />
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2 pl-4">
                          <Tooltip content="Chỉnh sửa">
                            <button
                              onClick={() => {
                                setEditPartnerType({ typeId, typeCode, typeName, description, status });
                                setShowEditPopup(true);
                              }}
                              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                              style={{ paddingLeft: "10px" }}
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

      {/* Popup tạo nhóm đối tác mới */}
      {showCreatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">Tạo nhóm đối tác mới</Typography>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowCreatePopup(false)}
              >
                ✕
              </button>
            </div>
            {errorMessage && (
              <Typography variant="small" color="red" className="mb-4">
                {errorMessage}
              </Typography>
            )}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <Typography variant="small" className="mb-2">Mã nhóm đối tác *</Typography>
                <Input
                  type="text"
                  value={newPartnerType.typeCode}
                  onChange={(e) => setNewPartnerType({ ...newPartnerType, typeCode: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <Typography variant="small" className="mb-2">Tên nhóm đối tác *</Typography>
                <Input
                  type="text"
                  value={newPartnerType.typeName}
                  onChange={(e) => setNewPartnerType({ ...newPartnerType, typeName: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <Typography variant="small" className="mb-2">Mô tả</Typography>
                <Textarea
                  type="text"
                  value={newPartnerType.description}
                  onChange={(e) => setNewPartnerType({ ...newPartnerType, description: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                color="gray"
                onClick={() => setShowCreatePopup(false)}
              >
                Hủy
              </Button>
              <Button
                color="blue"
                onClick={handleCreatePartnerType}
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Popup chỉnh sửa nhóm đối tác */}
      {showEditPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">Chỉnh sửa nhóm đối tác</Typography>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowEditPopup(false)}
              >
                ✕
              </button>
            </div>
            {errorMessage && (
              <Typography variant="small" color="red" className="mb-4">
                {errorMessage}
              </Typography>
            )}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="col-span-2">
                <Typography variant="small" className="mb-2">Mã nhóm đối tác *</Typography>
                <Input
                  type="text"
                  value={editPartnerType.typeCode}
                  onChange={(e) => setEditPartnerType({ ...editPartnerType, typeCode: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <Typography variant="small" className="mb-2">Tên nhóm đối tác *</Typography>
                <Input
                  type="text"
                  value={editPartnerType.typeName}
                  onChange={(e) => setEditPartnerType({ ...editPartnerType, typeName: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <Typography variant="small" className="mb-2">Trạng thái</Typography>
                <Select
                  value={editPartnerType.status ? "active" : "inactive"}
                  onChange={(value) => setEditPartnerType({ ...editPartnerType, status: value === "active" })}
                  className="w-full"
                >
                  <Option value="active">Đang hoạt động</Option>
                  <Option value="inactive">Ngừng hoạt động</Option>
                </Select>
              </div>
              <div className="col-span-2">
                <Typography variant="small" className="mb-2">Mô tả</Typography>
                <Textarea
                  type="text"
                  value={editPartnerType.description}
                  onChange={(e) => setEditPartnerType({ ...editPartnerType, description: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                color="gray"
                onClick={() => setShowEditPopup(false)}
              >
                Hủy
              </Button>
              <Button
                color="blue"
                onClick={handleEditPartnerType}
              >
                Lưu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerTypePage;
