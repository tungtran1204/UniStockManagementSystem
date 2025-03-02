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
  // Lấy mã order từ prop nextCode
  const [orderCode, setOrderCode] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [creator, setCreator] = useState("");
  const [description, setDescription] = useState("");

  // Danh sách hàng (dòng chi tiết)
  const [items, setItems] = useState([]);
  // Tăng ID tạm cho dòng
  const [nextId, setNextId] = useState(1);

  // Cập nhật orderCode khi nextCode thay đổi
  useEffect(() => {
    setOrderCode(nextCode || "");
  }, [nextCode]);

  // Thêm 1 dòng chi tiết
  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: nextId,
        maHang: "",
        tenHang: "",
        kho: "",
        donVi: "",
        soLuong: 0,
        donGia: 0,
      },
    ]);
    setNextId((id) => id + 1);
  };

  // Xóa hết dòng
  const handleRemoveAllRows = () => {
    setItems([]);
    setNextId(1);
  };

  // Xử lý Lưu
  const handleSave = async () => {
    const payload = {
      orderCode,
      orderDate,
      customerCode,
      customerName,
      address,
      phoneNumber,
      creator,
      description,
      items,
    };
    console.log("Tạo mới đơn hàng:", payload);
    // TODO: Gọi API createSaleOrder(payload) nếu cần

    // Reload danh sách nếu có hàm fetchOrders
    if (fetchOrders) {
      fetchOrders();
    }
    // Đóng modal
    onClose();
  };

  return (
    <Dialog open={open} handler={onClose} size="xl" className="max-h-screen overflow-auto">
      {/* Tiêu đề */}
      <DialogHeader className="border-b border-blue-gray-100">
        <Typography variant="h5" color="blue-gray">
          Đơn đặt hàng – {orderCode}
        </Typography>
      </DialogHeader>

      {/* Nội dung form */}
      <DialogBody divider className="flex flex-col gap-4">
        {/* Thông tin chung (2 cột) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-4">
            <Input
              label="Mã phiếu"
              value={orderCode}
              disabled
              className="w-[300px]"
              onChange={(e) => setOrderCode(e.target.value)}
            />
            <Input
              label="Mã khách hàng"
              value={customerCode}
              className="w-[300px]"
              variant="outlined"
              onChange={(e) => setCustomerCode(e.target.value)}
            />
            <Input
              label="Địa chỉ"
              value={address}
              className="w-[300px]"
              onChange={(e) => setAddress(e.target.value)}
            />
            <Input
              label="Người lập phiếu"
              value={creator}
              className="w-[300px]"
              onChange={(e) => setCreator(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-4">
            <Input
              label="Ngày lập phiếu"
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
            />
            <Input
              label="Tên khách hàng"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <Input
              label="Số điện thoại"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Textarea
              label="Diễn giải"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Bảng các dòng sản phẩm */}
        <div className="mt-2 overflow-auto rounded border border-gray-200">
          <table className="w-full text-left min-w-max">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["STT", "Mã hàng", "Tên hàng", "Kho", "Đơn vị", "Số lượng", "Đơn giá"].map((head) => (
                  <th key={head} className="px-4 py-2 text-sm font-semibold text-gray-600">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <tr key={item.id} className="border-b last:border-none">
                    <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                    <td className="px-4 py-2 text-sm">
                      <Input
                        variant="standard"
                        className="w-28"
                        value={item.maHang}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === item.id ? { ...row, maHang: e.target.value } : row
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
                              row.id === item.id ? { ...row, tenHang: e.target.value } : row
                            )
                          )
                        }
                      />
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <Input
                        variant="standard"
                        className="w-20"
                        value={item.kho}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === item.id ? { ...row, kho: e.target.value } : row
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
                              row.id === item.id ? { ...row, donVi: e.target.value } : row
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
                    <td className="px-4 py-2 text-sm">
                      <Input
                        variant="standard"
                        type="number"
                        className="w-24"
                        value={item.donGia}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row) =>
                              row.id === item.id
                                ? { ...row, donGia: Number(e.target.value) }
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
                  <td colSpan={7} className="px-4 py-2 text-center text-gray-500">
                    Chưa có dòng sản phẩm nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Nút Thêm dòng & Xóa hết dòng */}
        <div className="flex gap-2">
          <Button variant="outlined" onClick={handleAddRow}>
            + Thêm dòng
          </Button>
          <Button variant="outlined" color="red" onClick={handleRemoveAllRows}>
            Xóa hết dòng
          </Button>
        </div>
      </DialogBody>

      {/* Footer: Hủy & Lưu */}
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
