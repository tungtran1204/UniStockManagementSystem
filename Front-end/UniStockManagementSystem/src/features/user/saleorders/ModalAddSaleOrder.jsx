import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Textarea,
  Typography,
} from "@material-tailwind/react";

const ModalAddSaleOrder = ({ open, onClose, fetchOrders, nextCode }) => {
  // Các state lưu trữ giá trị của form
  const [orderCode, setOrderCode] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [salesman, setSalesman] = useState(""); // Nhân viên bán hàng
  const [description, setDescription] = useState("");

  // Danh sách sản phẩm/dòng chi tiết
  const [items, setItems] = useState([]);
  // Tăng ID tạm cho từng dòng để map
  const [nextId, setNextId] = useState(1);

  // Mỗi lần prop nextCode thay đổi, cập nhật lại mã phiếu
  useEffect(() => {
    setOrderCode(nextCode || "");
  }, [nextCode]);

  // Thêm 1 dòng sản phẩm
  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: nextId,
        maHang: "",
        tenHang: "",
        donVi: "",
        soLuong: 0,
      },
    ]);
    setNextId((id) => id + 1);
  };

  // Xóa hết dòng
  const handleRemoveAllRows = () => {
    setItems([]);
    setNextId(1);
  };

  // Nút Lưu
  const handleSave = async () => {
    const payload = {
      orderCode,
      orderDate,
      customerCode,
      customerName,
      address,
      phoneNumber,
      salesman,
      description,
      items,
    };
    console.log("Tạo mới đơn hàng:", payload);

    // Gọi hàm fetchOrders (nếu có) để reload danh sách
    if (fetchOrders) {
      fetchOrders();
    }
    // Đóng modal sau khi lưu
    onClose();
  };

  return (
    <Dialog
      open={open}
      handler={onClose}
      size="xl"
      className="w-[900px] max-h-screen overflow-auto"
    >
      {/* Tiêu đề */}
      <DialogHeader className="border-b border-blue-gray-100">
        <Typography variant="h5" color="blue-gray">
          Tạo đơn đặt hàng bán
        </Typography>
      </DialogHeader>

      <DialogBody divider className="flex flex-col gap-4">
        {/* Form 2 cột - Thông tin chung */}
        <div className="grid grid-cols-2 gap-12">
          {/* Cột trái */}
          <div className="flex flex-col gap-4">
            <Input
              label="Mã phiếu"
              value={orderCode}
              disabled
              className="w-64"
              onChange={(e) => setOrderCode(e.target.value)}
            />
            <Input
              label="Mã khách hàng"
              value={customerCode}
              className="w-64"
              onChange={(e) => setCustomerCode(e.target.value)}
            />
            <Input
              label="Địa chỉ"
              value={address}
              className="w-64"
              onChange={(e) => setAddress(e.target.value)}
            />
            <Input
              label="Nhân viên bán hàng"
              value={salesman}
              className="w-64"
              onChange={(e) => setSalesman(e.target.value)}
            />
          </div>

          {/* Cột phải */}
          <div className="flex flex-col gap-4">
            <Input
              label="Ngày lập phiếu"
              type="date"
              className="w-64"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
            <Input
              label="Tên khách hàng"
              value={customerName}
              className="w-64"
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Số điện thoại"
              value={phoneNumber}
              className="w-64"
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Textarea
              label="Diễn giải"
              value={description}
              className="w-64"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Bảng chi tiết sản phẩm */}
        <div className="mt-2 overflow-auto rounded border border-gray-200">
          <table className="w-full text-left min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["STT", "Mã hàng", "Tên hàng", "Đơn vị", "Số lượng"].map(
                  (head) => (
                    <th
                      key={head}
                      className="px-4 py-2 text-sm font-semibold text-gray-600"
                    >
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id} className="border-b last:border-none">
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <Input
                        variant="standard"
                        className="w-28"
                        value={item.maHang}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, maHang: e.target.value }
                                : row
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <Input
                        variant="standard"
                        className="w-32"
                        value={item.tenHang}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, tenHang: e.target.value }
                                : row
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <Input
                        variant="standard"
                        className="w-16"
                        value={item.donVi}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, donVi: e.target.value }
                                : row
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <Input
                        variant="standard"
                        type="number"
                        className="w-16"
                        value={item.soLuong}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, soLuong: Number(e.target.value) }
                                : row
                            )
                          )
                        }
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-2 text-center text-gray-500"
                  >
                    Chưa có dòng sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Nút thêm & xoá dòng */}
        <div className="flex gap-2">
          <Button variant="outlined" onClick={handleAddRow}>
            + Thêm dòng
          </Button>
          <Button variant="outlined" color="red" onClick={handleRemoveAllRows}>
            Xóa hết dòng
          </Button>
        </div>
      </DialogBody>

      {/* Footer */}
      <DialogFooter className="flex justify-end gap-2">
        <Button variant="text" color="gray" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="gradient" color="green" onClick={handleSave}>
          Lưu
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalAddSaleOrder;
