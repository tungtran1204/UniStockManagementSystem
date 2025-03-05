import React, { useState, useEffect, useRef } from "react";
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
import Select from "react-select";
import { getPartnersByType } from "@/features/user/partner/partnerService";

const CUSTOMER_TYPE_ID = 1; // ID nhóm khách hàng

//Custom lại Select cho khớp với các trường khác
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    borderColor: state.isFocused ? "black" : provided.borderColor,
    boxShadow: state.isFocused ? "0 0 0 1px black" : "none",
    "&:hover": {
      borderColor: "black",
    },
  }),
  menuList: (provided) => ({
    ...provided,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "#f3f4f6" // bg-gray-100 khi hover
      : state.isSelected
        ? "#e5e7eb" // bg-gray-200 khi chọn
        : "transparent",
    color: "#000",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#e5e7eb", // Đảm bảo không bị đổi màu xanh khi click
    },
  }),
};

const ModalAddSaleOrder = ({ open, onClose, fetchOrders, nextCode }) => {
  const [orderCode, setOrderCode] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const selectRef = useRef(null);
  const [description, setDescription] = useState("");
  const [customers, setCustomers] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [items, setItems] = useState([]);

  useEffect(() => {
    setOrderCode(nextCode || "");
  }, [nextCode]);

  useEffect(() => {
    if (open && selectRef.current) {
      setTimeout(() => {
        selectRef.current.blur(); // Ngăn chặn auto focus khi mở popup
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getPartnersByType(CUSTOMER_TYPE_ID);
        console.log("📢 API Response:", response);

        if (!response || !response.partners) {
          console.error("⚠️ API không trả về dữ liệu hợp lệ!");
          setCustomers([]);
          return;
        }

        setCustomers(
          response.partners.map((customer) => {
            const customerPartnerType = customer.partnerTypes.find(pt => pt.partnerType.typeId === CUSTOMER_TYPE_ID);
            return {
              code: customerPartnerType?.partnerCode || "",
              label: `${customerPartnerType?.partnerCode || ""} - ${customer.partnerName}`,
              name: customer.partnerName,
              address: customer.address,
              phone: customer.phone,
            };
          }).filter(customer => customer.code !== "")
        );
      } catch (error) {
        console.error("❌ Lỗi khi tải danh sách khách hàng:", error);
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, []);

  const handleCustomerChange = (selectedOption) => {
    console.log("🔘 [handleCustomerChange] Selected Option:", selectedOption);
    setCustomerCode(selectedOption.code);
    setCustomerName(selectedOption.name);
    setAddress(selectedOption.address);
    setPhoneNumber(selectedOption.phone);
  };

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

  return (
    <Dialog open={open} handler={onClose} size="xl" className="w-[900px] max-h-screen overflow-auto">
      <DialogHeader className="bg-gray-50">
        <Typography variant="h5" color="blue-gray" className="px-5" >
          Tạo đơn đặt hàng bán
        </Typography>
      </DialogHeader>

      <DialogBody divider className="flex flex-col gap-4 px-10 border-none">
        <div className="grid grid-cols-2 gap-x-12 gap-y-4">
          <div className="flex flex-col gap-4">
            <div className="col-span-2">
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">Mã phiếu</Typography>
              <Input label="Mã phiếu" value={orderCode} disabled className="w-64" />
            </div>
            <div className="col-span-2">
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">Mã khách hàng</Typography>
              <Select
                ref={selectRef}
                options={customers}
                value={customers.find(c => c.value === customerCode) || { value: customerCode, label: customerCode }}
                onChange={handleCustomerChange}
                label="Chọn khách hàng"
                isSearchable
                styles={customStyles}
                className="w-full rounded"
              />
            </div>
            <div className="col-span-2">
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">Người liên hệ</Typography>
              <Input label="Người liên hệ" value={address} className="w-64" disabled />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="col-span-2">
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">Ngày lập phiếu</Typography>
              <Input type="date" className="w-64" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </div>
            <div>
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">Tên khách hàng</Typography>
              <Input label="Tên khách hàng" value={customerName} className="w-64" disabled />
            </div>
            <div>
              <Typography variant="small" className="mb-2 text-gray-900 font-bold">Số điện thoại</Typography>
              <Input label="Số điện thoại" value={phoneNumber} className="w-64" disabled />
            </div>
          </div>
          <div className="col-span-2">
            <Typography variant="small" className="mb-2 text-gray-900 font-bold">Địa chỉ</Typography>
            <Input label="Địa chỉ" value={address} className="w-64" disabled />
          </div>
          <div className="col-span-2">
            <Typography variant="small" className="mb-2 text-gray-900 font-bold">Diễn giải</Typography>
            <Textarea placeholder="Diễn giải" value={description} className="w-64" onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>

        <div className="mt-2 overflow-auto border-none rounded">
          <table className="w-full text-left min-w-max border border-gray-200">
            <thead className="bg-gray-50 border border-gray-200">
              <tr>
                {["STT", "Mã hàng", "Tên hàng", "Đơn vị", "Số lượng"].map(
                  (head) => (
                    <th
                      key={head}
                      className="px-4 py-2 text-sm border border-gray-200 font-semibold text-gray-600"
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
                  <tr key={item.id} className="border border-gray-200">
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

        <div className="flex gap-2">
          <Button variant="outlined" onClick={handleAddRow}>
            + Thêm dòng
          </Button>
          <Button variant="outlined" color="red" onClick={handleRemoveAllRows}>
            Xóa hết dòng
          </Button>
        </div>
      </DialogBody>



      <DialogFooter className="flex justify-end gap-2">
        <Button variant="text" color="gray" onClick={onClose}>Hủy</Button>
        <Button variant="gradient" color="green">Lưu</Button>
      </DialogFooter>
    </Dialog>
  );
};

export default ModalAddSaleOrder;
