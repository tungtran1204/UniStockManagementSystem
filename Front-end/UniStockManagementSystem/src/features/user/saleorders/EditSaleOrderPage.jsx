import { FaSave, FaTimes, FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import Select, { components } from "react-select";

import { getPartnersByType } from "@/features/user/partner/partnerService";
import { getProducts, getSaleOrderById } from "./saleOrdersService";
import dayjs from "dayjs";
import useSaleOrder from "./useSaleOrder";
import ModalAddCustomer from "./ModalAddCustomer";

const CUSTOMER_TYPE_ID = 1;

const AddCustomerDropdownIndicator = (props) => {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <div
        style={{ cursor: "pointer", padding: "0 8px" }}
        onClick={(e) => {
          e.stopPropagation();
          props.selectProps.onAddCustomer();
        }}
      >
        <FaPlus />
      </div>
      <components.DropdownIndicator {...props} />
    </div>
  );
};

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

const EditSaleOrderPage = () => {
  const { orderId } = useParams(); // Lấy orderId từ URL
  const location = useLocation();
  const navigate = useNavigate();
  const { addOrder } = useSaleOrder();

  // Các state lưu thông tin đơn hàng
  const [orderCode, setOrderCode] = useState("");
  const [orderDate, setOrderDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([]);
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [isCreatePartnerPopupOpen, setIsCreatePartnerPopupOpen] = useState(false);

  // State kiểm soát chế độ chỉnh sửa và các lỗi validate
  const [isEditing, setIsEditing] = useState(false);
  const [customerError, setCustomerError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [itemsErrors, setItemsErrors] = useState({});

  const selectRef = useRef(null);

  // Log orderId và lấy dữ liệu đơn hàng từ API
  useEffect(() => {
    console.log("orderId từ URL:", orderId);
    const fetchOrderDetail = async () => {
      try {
        const orderData = await getSaleOrderById(orderId);
        console.log("Dữ liệu đơn hàng trả về từ API:", orderData);
        setOrderCode(orderData.orderCode || "");
        setOrderDate(
          orderData.orderDate
            ? dayjs(orderData.orderDate).format("YYYY-MM-DD")
            : dayjs().format("YYYY-MM-DD")
        );
        setCustomerCode(orderData.partnerCode || "");
        setCustomerName(orderData.partnerName || "");
        setDescription(orderData.note || "");
        setAddress(orderData.address || "");
        setContactName(orderData.contactName || "");
        setPhoneNumber(orderData.phoneNumber || "");
        setItems(orderData.orderDetails || []);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin đơn hàng:", error);
        alert("Lỗi khi tải thông tin đơn hàng. Vui lòng thử lại sau!");
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  // Hàm fetch danh sách khách hàng
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

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCustomerChange = (selectedOption) => {
    setCustomerCode(selectedOption.code);
    setCustomerName(selectedOption.name);
    setAddress(selectedOption.address);
    setPhoneNumber(selectedOption.phone);
    if (selectedOption.code) {
      setCustomerError("");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
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
    setItemsErrors((prev) => ({ ...prev, [nextId]: {} }));
    setGlobalError("");
  };

  const handleRemoveAllRows = () => {
    setItems([]);
    setNextId(1);
    setItemsErrors({});
    setGlobalError("");
  };

  const handleSelectProduct = (rowId, selectedOption) => {
    setItems((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              productCode: selectedOption.value,
              productName: selectedOption.label,
              unitName: selectedOption.unit,
            }
          : row
      )
    );
    setItemsErrors((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], productError: "" },
    }));
    setGlobalError("");
  };

  const handleQuantityChange = (rowId, newQuantity) => {
    setItems((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, quantity: Number(newQuantity) } : row
      )
    );
    if (Number(newQuantity) > 0) {
      setItemsErrors((prev) => ({
        ...prev,
        [rowId]: { ...prev[rowId], quantityError: "" },
      }));
      setGlobalError("");
    }
  };

  const aggregateItems = (itemsArray) => {
    const aggregated = itemsArray.reduce((acc, curr) => {
      const existingItem = acc.find(
        (item) => item.productCode === curr.productCode
      );
      if (existingItem) {
        existingItem.quantity += Number(curr.quantity);
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);
    return aggregated;
  };

  const handleSaveOrder = async () => {
    let hasError = false;
    if (!customerCode) {
      setCustomerError("Vui lòng chọn khách hàng!");
      hasError = true;
    } else {
      setCustomerError("");
    }

    if (items.length === 0) {
      setGlobalError("Vui lòng thêm ít nhất một dòng sản phẩm!");
      return;
    } else {
      setGlobalError("");
    }

    const newItemsErrors = {};
    items.forEach((item) => {
      newItemsErrors[item.id] = {};
      if (!item.productCode) {
        newItemsErrors[item.id].productError =
          "Vui lòng chọn sản phẩm cho dòng này!";
        hasError = true;
      }
      if (Number(item.quantity) <= 0) {
        newItemsErrors[item.id].quantityError =
          "Số lượng sản phẩm phải lớn hơn 0!";
        hasError = true;
      }
    });
    setItemsErrors(newItemsErrors);
    if (hasError) return;

    const aggregatedItems = aggregateItems(items);
    const payload = {
      orderCode,
      orderDate,
      partnerCode: customerCode,
      partnerName: customerName,
      status: "Đang chuẩn bị",
      note: description,
      orderDetails: aggregatedItems,
    };

    console.log("Dữ liệu gửi lên BE:", payload);

    try {
      await addOrder(payload);
      alert("Đã lưu đơn hàng thành công!");
      navigate("/user/sale-orders");
    } catch (error) {
      console.error("Lỗi khi lưu đơn hàng:", error);
      alert("Lỗi khi lưu đơn hàng. Vui lòng thử lại!");
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false);
      // Nếu cần, reset lại state về giá trị ban đầu từ API
    } else {
      navigate("/user/sale-orders");
    }
  };

  const handleOpenCreatePartnerPopup = () => {
    setIsCreatePartnerPopupOpen(true);
  };

  const handleCloseCreatePartnerPopup = () => {
    setIsCreatePartnerPopupOpen(false);
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-4 p-4 flex justify-between items-center">
          <Typography variant="h6" color="white">
            Đơn hàng {orderCode}
          </Typography>
          {!isEditing && (
            <Button
              variant="outlined"
              color="blue"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <FaEdit /> Chỉnh sửa
            </Button>
          )}
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
                  Khách hàng
                </Typography>
                {isEditing ? (
                  <Select
                    ref={selectRef}
                    options={customers}
                    value={customers.find((c) => c.code === customerCode) || null}
                    onChange={handleCustomerChange}
                    isSearchable
                    styles={customStyles}
                    placeholder="Chọn khách hàng"
                    components={{ DropdownIndicator: AddCustomerDropdownIndicator }}
                    onAddCustomer={handleOpenCreatePartnerPopup}
                  />
                ) : (
                  <Input
                    value={`${customerCode ? customerCode + " - " : ""}${customerName}`}
                    disabled
                    className="text-sm"
                  />
                )}
                {customerError && (
                  <Typography color="red" className="text-xs mt-1">
                    {customerError}
                  </Typography>
                )}
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
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="text-sm"
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                  disabled={!isEditing}
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
                    <th key={head} className="px-4 py-2 text-sm font-semibold text-gray-600 border-r last:border-r-0">
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
                        {isEditing ? (
                          <Select
                            placeholder="Chọn sản phẩm"
                            isSearchable
                            options={products}
                            styles={customStyles}
                            className="w-68"
                            value={products.find((p) => p.value === item.productCode) || null}
                            onChange={(selectedOption) => handleSelectProduct(item.id, selectedOption)}
                          />
                        ) : (
                          <Input
                            value={
                              products.find((p) => p.value === item.productCode)?.value ||
                              item.productName ||
                              ""
                            }
                            disabled
                            className="w-68 text-sm"
                          />
                        )}
                        {itemsErrors[item.id] && itemsErrors[item.id].productError && (
                          <Typography color="red" className="text-xs mt-1">
                            {itemsErrors[item.id].productError}
                          </Typography>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm border-r">
                        <Input
                          className="w-32 text-sm"
                          value={item.productName}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((row) =>
                                row.id === item.id ? { ...row, productName: e.target.value } : row
                              )
                            )
                          }
                          disabled
                        />
                      </td>
                      <td className="px-4 py-2 text-sm border-r">
                        <Input
                          className="w-16 text-sm"
                          value={item.unitName}
                          onChange={(e) =>
                            setItems((prev) =>
                              prev.map((row) =>
                                row.id === item.id ? { ...row, unitName: e.target.value } : row
                              )
                            )
                          }
                          disabled
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <Input
                          type="number"
                          className="w-16 text-sm"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          disabled={!isEditing}
                        />
                        {itemsErrors[item.id] && itemsErrors[item.id].quantityError && (
                          <Typography color="red" className="text-xs mt-1">
                            {itemsErrors[item.id].quantityError}
                          </Typography>
                        )}
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

          {/* Nút thêm / xóa dòng chỉ hiển thị khi đang ở chế độ chỉnh sửa */}
          {isEditing && (
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
          )}

          {/* Nút Lưu / Hủy hoặc nút quay lại */}
          <div className="flex flex-col gap-2">
            {globalError && (
              <Typography color="red" className="text-sm text-right">
                {globalError}
              </Typography>
            )}
            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <Button variant="text" color="gray" onClick={handleCancel} className="flex items-center gap-2">
                    <FaTimes /> Hủy
                  </Button>
                  <Button variant="gradient" color="green" onClick={handleSaveOrder} className="flex items-center gap-2">
                    <FaSave /> Lưu
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  color="blue"
                  onClick={() => navigate("/user/sale-orders")}
                  className="flex items-center gap-2"
                >
                  Quay lại
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {isCreatePartnerPopupOpen && (
        <ModalAddCustomer
          onClose={handleCloseCreatePartnerPopup}
          onSuccess={(newPartner) => {
            handleCloseCreatePartnerPopup();
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
};

export default EditSaleOrderPage;
