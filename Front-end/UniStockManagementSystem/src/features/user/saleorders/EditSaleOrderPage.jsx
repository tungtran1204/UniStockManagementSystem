import { FaSave, FaTimes, FaEdit, FaPlus, FaTrash, FaEye, FaCheck } from "react-icons/fa";
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Typography,
} from "@material-tailwind/react";
import Select, { components } from "react-select";
import dayjs from "dayjs";

import useSaleOrder from "./useSaleOrder";
import { getPartnersByType } from "@/features/user/partner/partnerService";
import { getProducts, getSaleOrderById, getTotalQuantityOfProduct } from "./saleOrdersService";
import ModalAddCustomer from "./ModalAddCustomer";
import PageHeader from "@/components/PageHeader";

// ------------------ 3 MODE ------------------
const MODE_VIEW = "view";
const MODE_EDIT = "edit";
const MODE_DINHMUC = "dinhMuc";
// ---------------------------------------------

const CUSTOMER_TYPE_ID = 2;

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
  const { orderId } = useParams();
  const navigate = useNavigate();

  // Hàm update order
  const { updateExistingOrder } = useSaleOrder();

  // ---------------- STATE ĐƠN HÀNG ----------------
  const [orderCode, setOrderCode] = useState("");
  const [orderDate, setOrderDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [partnerId, setPartnerId] = useState(null);
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");

  // Mảng dòng sản phẩm
  const [items, setItems] = useState([]);

  // Danh sách KH, SP
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Popup thêm KH
  const [isCreatePartnerPopupOpen, setIsCreatePartnerPopupOpen] = useState(false);

  // Lỗi
  const [customerError, setCustomerError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [itemsErrors, setItemsErrors] = useState({});

  // Tab hiển thị
  const [activeTab, setActiveTab] = useState("info");

  // Lưu dữ liệu ban đầu (để revert)
  const [originalData, setOriginalData] = useState(null);

  // -------------- 3 MODE: view / edit / dinhMuc ---------------
  const [mode, setMode] = useState(MODE_VIEW);

  // Xác định đang edit
  const isEditing = mode === MODE_EDIT;

  const selectRef = useRef(null);
  const [nextId, setNextId] = useState(1);

  // ========== Lấy đơn hàng ==========
  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const orderData = await getSaleOrderById(orderId);
        setOrderCode(orderData.orderCode || "");
        setOrderDate(
          orderData.orderDate
            ? dayjs(orderData.orderDate).format("YYYY-MM-DD")
            : dayjs().format("YYYY-MM-DD")
        );
        setPartnerId(orderData.partnerId || null);
        setCustomerCode(orderData.partnerCode || "");
        setCustomerName(orderData.partnerName || "");
        setDescription(orderData.note || "");
        setAddress(orderData.address || "");
        setContactName(orderData.contactName || "");
        setPhoneNumber(orderData.phoneNumber || "");

        // Map orderDetails => items và lấy tổng tồn kho từ API
        const loadedItems = await Promise.all(
          (orderData.orderDetails || []).map(async (detail, index) => {
            let totalQuantity = 0;
            try {
              totalQuantity = await getTotalQuantityOfProduct(detail.productId);
            } catch (error) {
              console.warn(`Không lấy được tồn kho cho sản phẩm ${detail.productId}`);
            }
            return {
              id: detail.orderDetailId ?? `loaded-${index + 1}`,
              productId: detail.productId ?? null,
              productCode: detail.productCode,
              productName: detail.productName,
              unitName: detail.unitName,
              quantity: detail.quantity ?? 0,
              inStock: totalQuantity ?? detail.inStock ?? 0, // Dùng dữ liệu từ API
              usedQuantity: detail.usedQuantity ?? 0,
              produceQuantity: detail.produceQuantity ?? 0,
            };
          })
        );
        setItems(loadedItems);

        // Lưu original
        setOriginalData({
          orderCode: orderData.orderCode || "",
          orderDate: orderData.orderDate
            ? dayjs(orderData.orderDate).format("YYYY-MM-DD")
            : dayjs().format("YYYY-MM-DD"),
          partnerId: orderData.partnerId || null,
          partnerCode: orderData.partnerCode || "",
          partnerName: orderData.partnerName || "",
          note: orderData.note || "",
          address: orderData.address || "",
          contactName: orderData.contactName || "",
          phoneNumber: orderData.phoneNumber || "",
          items: JSON.parse(JSON.stringify(loadedItems)),
        });
      } catch (error) {
        console.error("Lỗi khi lấy đơn hàng:", error);
        alert("Lỗi khi tải thông tin đơn hàng!");
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  // ========== Lấy danh sách KH ==========
  const fetchCustomers = async () => {
    try {
      const res = await getPartnersByType(CUSTOMER_TYPE_ID);
      if (!res || !res.partners) {
        console.error("API không trả về data hợp lệ!");
        setCustomers([]);
        return;
      }
      const mapped = res.partners
        .map((customer) => {
          const ctype = customer.partnerTypes.find(
            (pt) => pt.partnerType.typeId === CUSTOMER_TYPE_ID
          );
          return {
            id: customer.partnerId,
            code: ctype?.partnerCode || "",
            label: `${ctype?.partnerCode || ""} - ${customer.partnerName}`,
            name: customer.partnerName,
            address: customer.address,
            phone: customer.phone,
          };
        })
        .filter((c) => c.code !== "");
      setCustomers(mapped);
    } catch (err) {
      console.error("Lỗi KH:", err);
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ========== Lấy danh sách SP ==========
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const response = await getProducts();
        const productOptions = response.content.map((product) => ({
          productId: product.productId,
          value: product.productCode,
          label: `${product.productCode} - ${product.productName}`,
          unit: product.unitName,
        }));
        setProducts(productOptions);
      } catch (err) {
        console.error("Lỗi fetch SP:", err);
      }
    };
    fetchProductsData();
  }, []);

  // ========== Mode handlers ==========

  const handleSetMode = (newMode) => {
    setMode(newMode);
  };

  const handleEdit = () => {
    if (!originalData) return;
    handleSetMode(MODE_EDIT);
  };

  const handleXemDinhMuc = async () => {
    // Cập nhật lại tồn kho khi xem định mức
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        let totalQuantity = 0;
        try {
          totalQuantity = await getTotalQuantityOfProduct(item.productId);
        } catch (error) {
          console.warn(`Không lấy được tồn kho cho sản phẩm ${item.productId}`);
        }
        return { ...item, inStock: totalQuantity ?? item.inStock };
      })
    );
    setItems(updatedItems);
    handleSetMode(MODE_DINHMUC);
  };

  const handleCancelEdit = () => {
    // revert
    if (!originalData) return;
    setOrderCode(originalData.orderCode);
    setOrderDate(originalData.orderDate);
    setPartnerId(originalData.partnerId);
    setCustomerCode(originalData.partnerCode);
    setCustomerName(originalData.partnerName);
    setDescription(originalData.note);
    setAddress(originalData.address);
    setContactName(originalData.contactName);
    setPhoneNumber(originalData.phoneNumber);
    setItems(JSON.parse(JSON.stringify(originalData.items)));
    setGlobalError("");
    setItemsErrors({});
    setCustomerError("");
    handleSetMode(MODE_VIEW);
  };

  // Nút Quay lại
  const handleCancel = () => {
    if (mode === MODE_EDIT) {
      handleCancelEdit();
    } else if (mode === MODE_DINHMUC) {
      handleSetMode(MODE_VIEW);
    } else {
      navigate("/user/sale-orders");
    }
  };

  const handleXacNhan = () => {
    alert("Xác nhận định mức!");
    // handleSetMode(MODE_VIEW);
  };

  // ========== onChange KH ==========
  const handleCustomerChange = (selectedOption) => {
    setPartnerId(selectedOption?.id || null);
    setCustomerCode(selectedOption?.code || "");
    setCustomerName(selectedOption?.name || "");
    setAddress(selectedOption?.address || "");
    setPhoneNumber(selectedOption?.phone || "");
    if (selectedOption?.code) setCustomerError("");
  };

  // ========== Thêm/xóa dòng SP ==========

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `new-${nextId}`,
        productId: null,
        productCode: "",
        productName: "",
        unitName: "",
        quantity: 0,
        inStock: 0,
        usedQuantity: 0,
        produceQuantity: 0,
      },
    ]);
    setNextId((id) => id + 1);
    setGlobalError("");
  };

  const handleRemoveAllRows = () => {
    setItems([]);
    setNextId(1);
    setItemsErrors({});
    setGlobalError("");
  };

  const handleDeleteRow = (rowId) => {
    setItems((prev) => prev.filter((r) => r.id !== rowId));
  };

  // ========== Xử lý cell ==========

  const handleSelectProduct = (rowId, opt) => {
    setItems((prev) =>
      prev.map((r) =>
        r.id === rowId
          ? {
              ...r,
              productId: opt.productId,
              productCode: opt.value,
              productName: opt.label.split(" - ")[1] || "",
              unitName: opt.unit,
            }
          : r
      )
    );
    setGlobalError("");
  };

  const handleQuantityChange = (rowId, val) => {
    setItems((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, quantity: Number(val) } : r))
    );
    setGlobalError("");
  };

  const handleUsedQuantityChange = (rowId, val) => {
    setItems((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, usedQuantity: Number(val) } : r))
    );
    setGlobalError("");
  };

  const handleProduceQuantityChange = (rowId, val) => {
    setItems((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, produceQuantity: Number(val) } : r))
    );
    setGlobalError("");
  };

  // ========== Lưu đơn hàng ==========

  const handleSaveOrder = async () => {
    let hasError = false;
    if (!customerCode) {
      setCustomerError("Vui lòng chọn khách hàng!");
      hasError = true;
    }
    if (items.length === 0) {
      setGlobalError("Vui lòng thêm ít nhất một dòng sản phẩm!");
      return;
    }
    const newItemsErrors = {};
    items.forEach((it) => {
      newItemsErrors[it.id] = {};
      if (!it.productCode) {
        newItemsErrors[it.id].productError = "Chưa chọn sản phẩm!";
        hasError = true;
      }
      if (Number(it.quantity) <= 0) {
        newItemsErrors[it.id].quantityError = "Số lượng > 0!";
        hasError = true;
      }
    });
    setItemsErrors(newItemsErrors);
    if (hasError) return;

    // Gom dòng
    const aggregated = items.reduce((acc, cur) => {
      const ex = acc.find((x) => x.productCode === cur.productCode);
      if (ex) {
        ex.quantity += cur.quantity;
        ex.inStock += cur.inStock;
        ex.usedQuantity += cur.usedQuantity;
        ex.produceQuantity += cur.produceQuantity;
      } else {
        acc.push({ ...cur });
      }
      return acc;
    }, []);

    const payload = {
      orderId: Number(orderId),
      orderCode,
      partnerId,
      partnerCode: customerCode,
      partnerName: customerName,
      address,
      phoneNumber,
      contactName,
      status: "Đang chuẩn bị",
      orderDate,
      note: description,
      orderDetails: aggregated.map((it) => ({
        orderDetailId: it.orderDetailId || null,
        productId: it.productId || null,
        productCode: it.productCode,
        productName: it.productName,
        quantity: it.quantity,
        unitName: it.unitName,
        inStock: it.inStock,
        usedQuantity: it.usedQuantity,
        produceQuantity: it.produceQuantity,
      })),
    };

    console.log("PUT data:", payload);

    try {
      await updateExistingOrder(orderId, payload);
      alert("Cập nhật đơn hàng thành công!");
      handleSetMode(MODE_VIEW);
      navigate("/user/sale-orders");
    } catch (err) {
      console.error("Lỗi PUT order:", err);
      alert("Lỗi khi cập nhật đơn hàng!");
    }
  };

  // ========== Render bảng theo mode ==========

  const renderTableRows = () => {
    if (items.length === 0) {
      return (
        <tr>
          <td
            colSpan={mode === MODE_EDIT ? 9 : mode === MODE_DINHMUC ? 8 : 5}
            className="px-4 py-2 text-center text-gray-500"
          >
            Chưa có dòng sản phẩm nào
          </td>
        </tr>
      );
    }
    return items.map((item, idx) => (
      <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50">
        {/* STT */}
        <td className="px-4 py-2 text-sm text-gray-700 border-r">
          {idx + 1}
        </td>

        {/* Mã hàng */}
        <td className="px-4 py-2 text-sm border-r">
          <Select
            placeholder="Chọn sản phẩm"
            isSearchable
            options={products}
            styles={customStyles}
            className="w-52"
            value={products.find((p) => p.value === item.productCode) || null}
            onChange={(sel) => handleSelectProduct(item.id, sel)}
            isDisabled={mode !== MODE_EDIT} // Chỉ cho chọn SP khi edit
          />
          {itemsErrors[item.id]?.productError && (
            <Typography color="red" className="text-xs mt-1">
              {itemsErrors[item.id].productError}
            </Typography>
          )}
        </td>

        {/* Tên hàng */}
        <td className="px-4 py-2 text-sm border-r">
          <Input className="w-32 text-sm" value={item.productName} disabled />
        </td>

        {/* Đơn vị */}
        <td className="px-4 py-2 text-sm border-r">
          <Input className="w-16 text-sm" value={item.unitName} disabled />
        </td>

        {/* Số lượng */}
        <td className="px-4 py-2 text-sm border-r">
          <Input
            type="number"
            className="w-16 text-sm"
            value={item.quantity}
            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
            disabled={mode !== MODE_EDIT}
          />
          {itemsErrors[item.id]?.quantityError && (
            <Typography color="red" className="text-xs mt-1">
              {itemsErrors[item.id].quantityError}
            </Typography>
          )}
        </td>

        {/* 3 cột định mức => chỉ hiển thị khi mode=dinhMuc */}
        {mode === MODE_DINHMUC && (
          <>
            <td className="px-4 py-2 text-sm border-r">
              <Input
                type="number"
                className="w-16 text-sm"
                value={item.inStock || 0}
                disabled // Không cho chỉnh sửa trực tiếp
              />
            </td>
            <td className="px-4 py-2 text-sm border-r">
              <Input
                type="number"
                className="w-16 text-sm"
                value={item.usedQuantity || 0}
                onChange={(e) => handleUsedQuantityChange(item.id, e.target.value)}
              />
            </td>
            <td className="px-4 py-2 text-sm border-r">
              <Input
                type="number"
                className="w-16 text-sm"
                value={item.produceQuantity || 0}
                onChange={(e) => handleProduceQuantityChange(item.id, e.target.value)}
              />
            </td>
          </>
        )}

        {/* Thao tác => chỉ hiển thị khi mode=edit */}
        {mode === MODE_EDIT && (
          <td className="px-4 py-2 text-sm text-center">
            <Button
              color="red"
              variant="text"
              size="sm"
              onClick={() => handleDeleteRow(item.id)}
            >
              Xóa
            </Button>
          </td>
        )}
      </tr>
    ));
  };

  return (
    <div
      className="mb-8 flex flex-col gap-12"
      style={{ height: "calc(100vh - 180px)" }}
    >
      <Card className="bg-gray-50 p-7">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title={`Đơn hàng ${orderCode}`}
            addButtonLabel=""
            showAdd={false}
            showImport={false}
            showExport={false}
          />

          {/* Tab header */}
          <div className="mb-4 flex border-b">
            <button
              onClick={() => setActiveTab("info")}
              className={`py-2 px-4 ${
                activeTab === "info"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
            >
              Thông tin đơn hàng
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`py-2 px-4 ${
                activeTab === "products"
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-500"
              }`}
            >
              Danh sách sản phẩm
            </button>
          </div>

          {activeTab === "info" && (
            <div className="flex flex-col gap-6 mb-6">
              {/* Thông tin chung */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography
                    variant="small"
                    className="mb-2 font-bold text-gray-900"
                  >
                    Mã đơn
                  </Typography>
                  <Input
                    label="Mã đơn"
                    value={orderCode}
                    disabled
                    className="text-sm"
                  />
                </div>
                <div>
                  <Typography
                    variant="small"
                    className="mb-2 font-bold text-gray-900"
                  >
                    Ngày tạo đơn
                  </Typography>
                  <Input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="text-sm"
                    disabled={mode !== MODE_EDIT}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography
                    variant="small"
                    className="mb-2 font-bold text-gray-900"
                  >
                    Trạng thái đơn hàng
                  </Typography>
                  <Input
                    label="Trạng thái"
                    value="Đang chuẩn bị"
                    disabled
                    className="text-sm"
                  />
                </div>
              </div>

              <div>
                <Typography
                  variant="small"
                  className="mb-2 font-bold text-gray-900"
                >
                  Diễn giải
                </Typography>
                <Textarea
                  placeholder="Diễn giải"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="text-sm"
                  disabled={mode !== MODE_EDIT}
                />
              </div>

              {/* Thông tin khách hàng */}
              <Typography
                variant="h6"
                className="mt-4 mb-2 pb-2 font-bold text-gray-900 border-b"
              >
                Thông tin khách hàng
              </Typography>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography
                    variant="small"
                    className="mb-2 font-bold text-gray-900"
                  >
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
                    components={{ DropdownIndicator: AddCustomerDropdownIndicator }}
                    onAddCustomer={() => setIsCreatePartnerPopupOpen(true)}
                    isDisabled={mode !== MODE_EDIT}
                  />
                  {customerError && (
                    <Typography color="red" className="text-xs mt-1">
                      {customerError}
                    </Typography>
                  )}
                </div>
                <div>
                  <Typography
                    variant="small"
                    className="mb-2 font-bold text-gray-900"
                  >
                    Tên khách hàng
                  </Typography>
                  <Input
                    label="Tên khách hàng"
                    value={customerName}
                    disabled
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography
                    variant="small"
                    className="mb-2 font-bold text-gray-900"
                  >
                    Địa chỉ
                  </Typography>
                  <Input
                    label="Địa chỉ"
                    value={address}
                    disabled
                    className="text-sm"
                  />
                </div>
                <div>
                  <Typography
                    variant="small"
                    className="mb-2 font-bold text-gray-900"
                  >
                    Số điện thoại
                  </Typography>
                  <Input
                    label="Số điện thoại"
                    value={phoneNumber}
                    disabled
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography
                    variant="small"
                    className="mb-2 font-bold text-gray-900"
                  >
                    Người liên hệ
                  </Typography>
                  <Input
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="text-sm"
                    disabled
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              {/* Nếu mode=VIEW => nút Xem định mức */}
              {mode === MODE_VIEW && (
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outlined"
                    onClick={handleXemDinhMuc}
                    className="flex items-center gap-2"
                  >
                    <FaEye /> Xem định mức
                  </Button>
                </div>
              )}

              {/* Bảng */}
              <div className="border border-gray-200 rounded mb-4">
                <table className="w-full text-left min-w-max border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">STT</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">
                        Mã hàng
                      </th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">
                        Tên hàng
                      </th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">
                        Đơn vị
                      </th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">
                        Số lượng
                      </th>
                      {/* 3 cột định mức => chỉ hiển thị khi mode=dinhMuc */}
                      {mode === MODE_DINHMUC && (
                        <>
                          <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">
                            Tồn kho
                          </th>
                          <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">
                            SL muốn dùng
                          </th>
                          <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">
                            SL cần SX
                          </th>
                        </>
                      )}
                      {/* Thao tác => chỉ hiển thị khi mode=edit */}
                      {mode === MODE_EDIT && (
                        <th className="px-4 py-2 text-sm font-semibold text-gray-600">
                          Thao tác
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>{renderTableRows()}</tbody>
                </table>
              </div>

              {/* Nút thêm / xóa dòng => chỉ hiển thị khi mode=edit */}
              {mode === MODE_EDIT && (
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outlined"
                    onClick={handleAddRow}
                    className="flex items-center gap-2"
                  >
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
            </div>
          )}

          {/* Thông báo lỗi & Nút */}
          <div className="flex flex-col gap-2">
            {globalError && (
              <Typography color="red" className="text-sm text-right">
                {globalError}
              </Typography>
            )}
            <div className="flex justify-end gap-2">
              {/* Nút Quay lại / Hủy */}
              <Button
                variant="text"
                color="gray"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <FaTimes />
                {mode === MODE_EDIT ? "Hủy" : "Quay lại"}
              </Button>

              {/* mode=VIEW => hiển thị nút "Chỉnh sửa" (nếu tab=products) */}
              {mode === MODE_VIEW && activeTab === "products" && (
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <FaEdit /> Chỉnh sửa
                </Button>
              )}

              {/* mode=EDIT => nút "Lưu" */}
              {mode === MODE_EDIT && (
                <Button
                  variant="gradient"
                  color="green"
                  onClick={handleSaveOrder}
                  className="flex items-center gap-2"
                >
                  <FaSave /> Lưu
                </Button>
              )}

              {/* mode=DINHMUC => nút "Xác nhận" */}
              {mode === MODE_DINHMUC && (
                <Button
                  variant="gradient"
                  color="green"
                  onClick={handleXacNhan}
                  className="flex items-center gap-2"
                >
                  <FaCheck /> Xác nhận
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {isCreatePartnerPopupOpen && (
        <ModalAddCustomer
          onClose={() => setIsCreatePartnerPopupOpen(false)}
          onSuccess={(newPartner) => {
            setIsCreatePartnerPopupOpen(false);
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
};

export default EditSaleOrderPage;