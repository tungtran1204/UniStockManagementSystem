import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import Select from "react-select";
import { FaSave, FaTimes, FaPlus, FaTrash } from "react-icons/fa";
import { getPartnersByType } from "@/features/user/partner/partnerService";
import { getProducts } from "./saleOrdersService";
import dayjs from "dayjs";
import useSaleOrder from "./useSaleOrder";

const CUSTOMER_TYPE_ID = 1; // ID nhóm khách hàng

// Custom style cho react-select (dùng cho cả khách hàng và sản phẩm)
const customStyles = {
  control: (provided, state) => ({
    ...provided,
    minWidth: 200,
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
      ? "#f3f4f6"
      : state.isSelected
      ? "#e5e7eb"
      : "transparent",
    color: "#000",
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#e5e7eb",
    },
  }),
};

const AddSaleOrderPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addOrder } = useSaleOrder();

  // Nhận mã phiếu từ state truyền qua navigate
  const nextCode = location.state?.nextCode || "";

  // State form
  const [orderCode, setOrderCode] = useState("");
  const [orderDate, setOrderDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [customers, setCustomers] = useState([]);

  // Danh sách sản phẩm lấy từ API
  const [products, setProducts] = useState([]);

  // Bảng chi tiết hàng
  // Đổi các trường sang productCode, productName, unitName, quantity
  const [items, setItems] = useState([]);
  const [nextId, setNextId] = useState(1);

  const selectRef = useRef(null);

  // Gán mã phiếu nếu có
  useEffect(() => {
    setOrderCode(nextCode);
  }, [nextCode]);

  // Lấy danh sách khách hàng
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await getPartnersByType(CUSTOMER_TYPE_ID);
        if (!response || !response.partners) {
          console.error("API không trả về dữ liệu hợp lệ!");
          setCustomers([]);
          return;
        }
        const mappedCustomers = response.partners
          .map((customer) => {
            const customerPartnerType = customer.partnerTypes.find(
              (pt) => pt.partnerType.typeId === CUSTOMER_TYPE_ID
            );
            return {
              code: customerPartnerType?.partnerCode || "",
              label: `${customerPartnerType?.partnerCode || ""} - ${customer.partnerName}`,
              name: customer.partnerName,
              address: customer.address,
              phone: customer.phone,
            };
          })
          .filter((c) => c.code !== "");
        setCustomers(mappedCustomers);
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
        setCustomers([]);
      }
    };
    fetchCustomers();
  }, []);

  const handleCustomerChange = (selectedOption) => {
    setCustomerCode(selectedOption.code);
    setCustomerName(selectedOption.name);
    setAddress(selectedOption.address);
    setPhoneNumber(selectedOption.phone);
  };

  // Lấy danh sách sản phẩm
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        // API trả về object có trường content chứa mảng sản phẩm
        const productOptions = response.content.map((product) => ({
          value: product.productCode,
          label: product.productName,
          unit: product.unitName,
        }));
        setProducts(productOptions);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      }
    };
    fetchProducts();
  }, []);

  // Thêm dòng mới (dùng productCode, productName, unitName, quantity)
  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: nextId,
        productCode: "",
        productName: "",
        unitName: "",
        quantity: 0,
      },
    ]);
    setNextId((id) => id + 1);
  };

  // Xoá hết dòng
  const handleRemoveAllRows = () => {
    setItems([]);
    setNextId(1);
  };

  // Khi chọn sản phẩm => set productCode, productName, unitName
  const handleSelectProduct = (rowId, selectedOption) => {
    setItems((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              productCode: selectedOption.value,   // Mã sản phẩm
              productName: selectedOption.label,   // Tên sản phẩm
              unitName: selectedOption.unit,       // Đơn vị
            }
          : row
      )
    );
  };

  // Lưu đơn hàng
  const handleSaveOrder = async () => {
    try {
      // Tạo payload
      const payload = {
        orderCode,
        orderDate,
        partnerCode: customerCode,
        partnerName: customerName,
        status: "Đang chuẩn bị",
        note: description,
        // Mỗi item bây giờ đã có { productCode, productName, unitName, quantity }
        orderDetails: items,
      };

      console.log("Dữ liệu gửi lên BE:", payload);

      // Gọi hàm addOrder
      const addedOrder = await addOrder(payload);
      alert("Đã lưu đơn hàng thành công!");
      navigate("/user/sale-orders");
    } catch (error) {
      console.error("Lỗi khi lưu đơn hàng:", error);
      alert("Lỗi khi lưu đơn hàng. Vui lòng thử lại!");
    }
  };

  // Hủy => Quay lại danh sách
  const handleCancel = () => {
    navigate("/user/sale-orders");
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-4 p-4">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">
              Đơn hàng {orderCode}
            </Typography>
          </div>
        </CardHeader>

        <CardBody className="px-4 py-4">
          {/* Thông tin chung */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-6">
            <div className="flex flex-col gap-4">
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Mã phiếu
                </Typography>
                <Input label="Mã phiếu" value={orderCode} disabled className="text-sm" />
              </div>
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Mã khách hàng
                </Typography>
                <Select
                  ref={selectRef}
                  options={customers}
                  value={customers.find((c) => c.code === customerCode) || null}
                  onChange={handleCustomerChange}
                  isSearchable
                  styles={customStyles}
                  placeholder="Chọn khách hàng"
                />
              </div>
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Địa chỉ
                </Typography>
                <Input label="Địa chỉ" value={address} disabled className="text-sm" />
              </div>
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Người liên hệ
                </Typography>
                <Input
                  disabled
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="disabled:opacity-100 disabled:font-normal disabled:text-black text-sm"
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Ngày lập phiếu
                </Typography>
                <Input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Tên khách hàng
                </Typography>
                <Input label="Tên khách hàng" value={customerName} disabled className="text-sm" />
              </div>
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Số điện thoại
                </Typography>
                <Input label="Số điện thoại" value={phoneNumber} disabled className="text-sm" />
              </div>
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
                  Diễn giải
                </Typography>
                <Textarea
                  placeholder="Diễn giải"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Bảng chi tiết hàng */}
          <div className="border border-gray-200 rounded mb-4">
            <table className="w-full text-left min-w-max border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["STT", "Mã hàng", "Tên hàng", "Đơn vị", "Số lượng"].map((head) => (
                    <th
                      key={head}
                      className="px-4 py-2 text-sm font-semibold text-gray-600 border-r last:border-r-0"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item, index) => (
                    <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-700 border-r">{index + 1}</td>
                      <td className="px-4 py-2 text-sm border-r">
                        <Select
                          placeholder="Chọn sản phẩm"
                          isSearchable
                          options={products}
                          styles={customStyles}
                          className="w-68"
                          // Tìm theo productCode
                          value={products.find((p) => p.value === item.productCode) || null}
                          onChange={(selectedOption) => {
                            setItems((prev) =>
                              prev.map((row) =>
                                row.id === item.id
                                  ? {
                                      ...row,
                                      productCode: selectedOption.value,
                                      productName: selectedOption.label,
                                      unitName: selectedOption.unit,
                                    }
                                  : row
                              )
                            );
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 text-sm border-r">
                        <Input
                          className="w-32 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                          disabled
                          value={item.productName}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((row) =>
                                row.id === item.id ? { ...row, productName: e.target.value } : row
                              )
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2 text-sm border-r">
                        <Input
                          className="w-16 text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                          disabled
                          value={item.unitName}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((row) =>
                                row.id === item.id ? { ...row, unitName: e.target.value } : row
                              )
                            )
                          }
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <Input
                          type="number"
                          className="w-16 text-sm"
                          value={item.quantity}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((row) =>
                                row.id === item.id ? { ...row, quantity: Number(e.target.value) } : row
                              )
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-2 text-center text-gray-500">
                      Chưa có dòng sản phẩm nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Nút thêm / xóa dòng */}
          <div className="flex gap-2 mb-4">
            <Button variant="outlined" onClick={handleAddRow} className="flex items-center gap-2">
              <FaPlus /> Thêm dòng
            </Button>
            <Button
              variant="outlined"
              color="red"
              onClick={handleRemoveAllRows}
              className="flex items-center gap-2"
            >
              <FaTrash /> Xóa hết dòng
            </Button>
          </div>

          {/* Nút Lưu / Hủy */}
          <div className="flex justify-end gap-2">
            <Button variant="text" color="gray" onClick={handleCancel} className="flex items-center gap-2">
              <FaTimes /> Hủy
            </Button>
            <Button variant="gradient" color="green" onClick={handleSaveOrder} className="flex items-center gap-2">
              <FaSave /> Lưu
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddSaleOrderPage;
