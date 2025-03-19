import { FaSave, FaTimes, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
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
import { getProducts, getSaleOrderById } from "./saleOrdersService";
import ModalAddCustomer from "./ModalAddCustomer";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";

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

// Tuỳ chỉnh style cho react-select
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
  console.log("orderId = ", orderId);
  const navigate = useNavigate();

  // Gọi custom hook để dùng hàm update
  const { updateExistingOrder } = useSaleOrder();

  //================= State cho đơn hàng =================
  const [orderCode, setOrderCode] = useState("");
  const [orderDate, setOrderDate] = useState(dayjs().format("YYYY-MM-DD"));
  // Thêm partnerId để khớp với BE
  const [partnerId, setPartnerId] = useState(null);
  const [customerCode, setCustomerCode] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [description, setDescription] = useState("");

  // Dữ liệu dòng sản phẩm (đã thêm inStock, usedQuantity, produceQuantity)
  const [items, setItems] = useState([]);

  //================= Danh sách khách hàng, sản phẩm =================
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);

  // Popup tạo khách hàng
  const [isCreatePartnerPopupOpen, setIsCreatePartnerPopupOpen] = useState(false);

  // Lỗi validate
  const [customerError, setCustomerError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [itemsErrors, setItemsErrors] = useState({});

  // Tab hiển thị
  const [activeTab, setActiveTab] = useState("info");

  // Trạng thái "đang chỉnh sửa" hay chỉ xem
  const [isEditing, setIsEditing] = useState(false);

  // Lưu dữ liệu ban đầu (để revert nếu ấn "Hủy")
  const [originalData, setOriginalData] = useState(null);

  const selectRef = useRef(null);

  const [showStockColumns, setShowStockColumns] = useState(false);
  // Quản lý ẩn/hiện cột qua columnVisibilityModel
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({
    stt: true,
    productCode: true,
    productName: true,
    unitName: true,
    quantity: true,
    inStock: false,       // ẩn mặc định
    usedQuantity: false,  // ẩn mặc định
    produceQuantity: true,
    actions: true,
  });

  const toggleStockColumns = () => {
    setShowStockColumns(prev => !prev);
    // Cập nhật cột inStock, usedQuantity
    setColumnVisibilityModel(prev => ({
      ...prev,
      inStock: !prev.inStock,         // từ false -> true, hoặc ngược lại
      usedQuantity: !prev.usedQuantity
    }));
  };

  //================= Lấy dữ liệu đơn hàng =================
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
        // partnerId
        setPartnerId(orderData.partnerId || null);
        setCustomerCode(orderData.partnerCode || "");
        setCustomerName(orderData.partnerName || "");
        setDescription(orderData.note || "");
        setAddress(orderData.address || "");
        setContactName(orderData.contactName || "");
        setPhoneNumber(orderData.phoneNumber || "");

        // Thêm 3 trường inStock, usedQuantity, produceQuantity vào từng dòng
        const loadedItems = (orderData.orderDetails || []).map((detail) => ({
          ...detail,
          // Dựa vào dữ liệu BE nếu có, hoặc mặc định 0
          inStock: detail.inStock ?? 0,
          usedQuantity: detail.usedQuantity ?? 0,
          produceQuantity: detail.produceQuantity ?? 0,
        }));
        setItems(loadedItems);

        // Lưu dữ liệu ban đầu
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
        console.error("Lỗi khi lấy thông tin đơn hàng:", error);
        alert("Lỗi khi tải thông tin đơn hàng. Vui lòng thử lại sau!");
      }
    };

    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  //================= Fetch danh sách khách hàng =================
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
            // Lưu partnerId để BE map
            id: customer.partnerId,
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

  //================= Fetch danh sách sản phẩm =================
  useEffect(() => {
    const fetchProductsData = async () => {
      try {
        const response = await getProducts();
        // Thêm productId để BE map
        const productOptions = response.content.map((product) => ({
          productId: product.productId,
          value: product.productCode,
          label: `${product.productCode} - ${product.productName}`,
          unit: product.unitName,
        }));
        setProducts(productOptions);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      }
    };
    fetchProductsData();
  }, []);

  //================= Chuyển sang chế độ chỉnh sửa =================
  const handleEdit = () => {
    if (!originalData) return;
    setIsEditing(true);
  };

  //================= Hủy chỉnh sửa: revert dữ liệu =================
  const handleCancelEdit = () => {
    if (originalData) {
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
    }
    setIsEditing(false);
    setGlobalError("");
    setItemsErrors({});
    setCustomerError("");
  };

  //================= Nút "Quay lại" / "Hủy" =================
  const handleCancel = () => {
    if (isEditing) {
      handleCancelEdit();
    } else {
      navigate("/user/sale-orders");
    }
  };

  //================= onChange cho Select Khách hàng =================
  const handleCustomerChange = (selectedOption) => {
    // Lưu partnerId + code + name ...
    setPartnerId(selectedOption.id || null);
    setCustomerCode(selectedOption.code);
    setCustomerName(selectedOption.name);
    setAddress(selectedOption.address);
    setPhoneNumber(selectedOption.phone);
    if (selectedOption.code) {
      setCustomerError("");
    }
  };

  //================= Thêm / Xóa dòng sản phẩm =================
  const [nextId, setNextId] = useState(1);

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `new-${nextId + 1}`, // Tạo ID tạm để FE quản lý
        productId: null,
        productCode: "",
        productName: "",
        unitName: "",
        quantity: 0,
        // Thêm 3 trường
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
    setItems((prev) => prev.filter((row) => row.id !== rowId));
  };

  //================= Hàm xử lý chọn sản phẩm, nhập số lượng, v.v... =================
  const handleSelectProduct = (rowId, selectedOption) => {
    // Lưu productId + productCode + ...
    setItems((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
            ...row,
            productId: selectedOption.productId,
            productCode: selectedOption.value,
            productName: selectedOption.label,
            unitName: selectedOption.unit,
          }
          : row
      )
    );
    setGlobalError("");
  };

  const handleQuantityChange = (rowId, newQuantity) => {
    setItems((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, quantity: Number(newQuantity) } : row
      )
    );
    setGlobalError("");
  };

  // Thêm các hàm xử lý 3 trường mới
  const handleInStockChange = (rowId, newValue) => {
    setItems((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, inStock: Number(newValue) } : row
      )
    );
    setGlobalError("");
  };

  const handleUsedQuantityChange = (rowId, newValue) => {
    setItems((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, usedQuantity: Number(newValue) } : row
      )
    );
    setGlobalError("");
  };

  const handleProduceQuantityChange = (rowId, newValue) => {
    setItems((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, produceQuantity: Number(newValue) } : row
      )
    );
    setGlobalError("");
  };

  //================= Lưu đơn hàng (PUT) =================
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

    // Kiểm tra lỗi cho từng dòng
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
      // Bạn có thể thêm rule kiểm tra inStock, usedQuantity, produceQuantity ở đây nếu cần
    });
    setItemsErrors(newItemsErrors);
    if (hasError) return;

    // Gom các dòng trùng productCode
    const aggregatedItems = items.reduce((acc, curr) => {
      const existing = acc.find((x) => x.productCode === curr.productCode);
      if (existing) {
        existing.quantity += curr.quantity;
        // Gom luôn 3 trường mới nếu cần
        existing.inStock += curr.inStock;
        existing.usedQuantity += curr.usedQuantity;
        existing.produceQuantity += curr.produceQuantity;
      } else {
        acc.push({ ...curr });
      }
      return acc;
    }, []);

    // Tạo payload (thêm 3 trường mới nếu BE có dùng)
    const payload = {
      orderId: Number(orderId),
      orderCode,
      partnerId: partnerId,
      partnerCode: customerCode,
      partnerName: customerName,
      address,
      phoneNumber,
      contactName,
      status: "Đang chuẩn bị",
      orderDate,
      note: description,
      orderDetails: aggregatedItems.map((item) => ({
        // Nếu dòng cũ => item.orderDetailId. Dòng mới => null
        orderDetailId: item.orderDetailId || null,
        productId: item.productId || null,
        productCode: item.productCode,
        productName: item.productName,
        quantity: item.quantity,
        unitName: item.unitName,
        // Gửi thêm 3 trường mới lên nếu BE có
        inStock: item.inStock,
        usedQuantity: item.usedQuantity,
        produceQuantity: item.produceQuantity,
      })),
    };

    console.log("Dữ liệu PUT:", payload);

    try {
      await updateExistingOrder(orderId, payload);
      alert("Đã cập nhật đơn hàng thành công!");
      setIsEditing(false);
      navigate("/user/sale-orders");
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
      alert("Lỗi khi cập nhật đơn hàng. Vui lòng thử lại!");
    }
  };

  // Popup thêm khách hàng
  const handleOpenCreatePartnerPopup = () => {
    setIsCreatePartnerPopupOpen(true);
  };
  const handleCloseCreatePartnerPopup = () => {
    setIsCreatePartnerPopupOpen(false);
  };

  // columnsConfig: Mỗi phần tử là 1 cột, map đến field trong items
  // Ta có các cột: STT, productCode, productName, unitName, quantity, inStock, usedQuantity, produceQuantity, actions
  const columnsConfig = [
    {
      field: "stt",
      headerName: "STT",
      minWidth: 60,
      editable: isEditing,
      renderCell: (params) => {
        return params.id; // Return 1-based index
      },
    },
    {
      field: "productCode",
      headerName: "Mã hàng",
      minWidth: 150,
      editable: false, // chỉ cho sửa nếu isEditing = true
      // Ở đây bạn có thể render 1 <Select> (react-select) giống code cũ
      // Tuỳ vào "item" => params.row
      renderCell: (params) => {
        const rowData = params.row; // item tương ứng
        return (
          <Select
            placeholder="Chọn sản phẩm"
            options={products}
            styles={customStyles}
            className="w-28 text-sm"
            // mapping: rowData.productCode => "value"
            value={products.find((p) => p.value === rowData.productCode) || null}
            onChange={(selectedOption) =>
              handleSelectProduct(rowData.id, selectedOption)
            }
            isSearchable
            isDisabled={!isEditing}
          />
        );
      },
    },
    {
      field: "productName",
      headerName: "Tên hàng",
      minWidth: 200,
      editable: isEditing,
      renderCell: (params) => {
        return (
          <input
            disabled
            className="text-sm bg-transparent outline-none border-none w-full"
            value={params.row.productName || ""}
            readOnly
          />
        );
      },
    },
    {
      field: "unitName",
      headerName: "Đơn vị",
      minWidth: 100,
      editable: isEditing,
      renderCell: (params) => {
        return (
          <input
            disabled
            className="text-sm bg-transparent outline-none border-none w-full"
            value={params.row.unitName || ""}
            readOnly
          />
        );
      },
    },
    {
      field: "quantity",
      headerName: "Số lượng",
      minWidth: 100,
      editable: isEditing,
      renderCell: (params) => {
        const rowData = params.row;
        return (
          <>
            <input
              type="number"
              className="w-14 text-sm"
              value={rowData.quantity || 0}
              disabled={!isEditing}
              onChange={(e) => handleQuantityChange(rowData.id, e.target.value)}
            />
            {itemsErrors[rowData.id]?.quantityError && (
              <span style={{ color: "red", fontSize: "0.75rem" }}>
                {itemsErrors[rowData.id].quantityError}
              </span>
            )}
          </>
        );
      },
    },

    // Nếu đang "Xem tồn kho" => hiển thị inStock, usedQuantity
    // Ngược lại => ẩn 2 cột này. => Cách đơn giản: định nghĩa cột,
    // sau đó tuỳ `showStockColumns` để hiển thị/ẩn (hide: true/false).
    {
      field: "inStock",
      headerName: "Tồn kho",
      minWidth: 100,
      editable: isEditing,
      renderCell: (params) => {
        const rowData = params.row;
        return (
          <input
            type="number"
            className="w-14 text-sm"
            value={rowData.inStock || 0}
            disabled={!isEditing}
            onChange={(e) => handleInStockChange(rowData.id, e.target.value)}
          />
        );
      },
    },
    {
      field: "usedQuantity",
      headerName: "SL sử dụng",
      minWidth: 100,
      editable: isEditing,
      renderCell: (params) => {
        const rowData = params.row;
        return (
          <input
            type="number"
            className="w-14 text-sm"
            value={rowData.usedQuantity || 0}
            disabled={!isEditing}
            onChange={(e) => handleUsedQuantityChange(rowData.id, e.target.value)}
          />
        );
      },
    },
    {
      field: "produceQuantity",
      headerName: "SL sản xuất",
      minWidth: 100,
      editable: isEditing,
      renderCell: (params) => {
        const rowData = params.row;
        return (
          <input
            type="number"
            className="w-14 text-sm"
            value={rowData.produceQuantity || 0}
            disabled={!isEditing}
            onChange={(e) =>
              handleProduceQuantityChange(rowData.id, e.target.value)
            }
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Thao tác",
      minWidth: 120,
      // Không chỉnh sửa cột này
      editable: false,
      renderCell: (params) => {
        const rowData = params.row;
        return isEditing ? (
          <Button
            color="error"
            variant="text"
            size="small"
            onClick={() => handleDeleteRow(rowData.id)}
          >
            Xoá
          </Button>
        ) : null;
      },
    },
  ];

  const rows = items.map((row, index) => ({
    id: index + 1,
    ...row,
  }));

  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: "calc(100vh - 180px)" }}>
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
              className={`py-2 px-4 ${activeTab === "info"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
                }`}
            >
              Thông tin đơn hàng
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`py-2 px-4 ${activeTab === "products"
                ? "border-b-2 border-blue-500 text-blue-500"
                : "text-gray-500"
                }`}
            >
              Danh sách sản phẩm
            </button>
          </div>

          {/* Nội dung từng tab */}
          {activeTab === "info" && (
            <div className="flex flex-col gap-6 mb-6">
              {/* --- Thông tin chung --- */}
              <div className="grid grid-cols-2 gap-4">
                {/* Mã đơn (bên trái) */}
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
                    Mã đơn
                  </Typography>
                  <Input
                    label="Mã đơn"
                    value={orderCode}
                    disabled
                    className="text-sm"
                  />
                </div>

                {/* Ngày tạo đơn (bên phải) */}
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
                    Ngày tạo đơn
                  </Typography>
                  <Input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="text-sm"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Trạng thái đơn hàng (bên phải) */}
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
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

              {/* Diễn giải (full width) */}
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

              {/* --- Thông tin khách hàng --- */}
              <Typography variant="h6" className="mt-4 mb-2 pb-2 font-bold text-gray-900 border-b">
                Thông tin khách hàng
              </Typography>

              <div className="grid grid-cols-2 gap-4">
                {/* Mã khách hàng (bên trái) */}
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
                    components={{ DropdownIndicator: AddCustomerDropdownIndicator }}
                    onAddCustomer={handleOpenCreatePartnerPopup}
                    isDisabled={!isEditing}
                  />
                  {customerError && (
                    <Typography color="red" className="text-xs mt-1">
                      {customerError}
                    </Typography>
                  )}
                </div>

                {/* Tên khách hàng (bên phải) */}
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
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
                {/* Địa chỉ (bên trái) */}
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
                    Địa chỉ
                  </Typography>
                  <Input
                    label="Địa chỉ"
                    value={address}
                    disabled
                    className="text-sm"
                  />
                </div>

                {/* Số điện thoại (bên phải) */}
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
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
                {/* Người liên hệ (bên trái) */}
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
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
              {/* Nút "Xem tồn kho" */}
              <div className="flex justify-end mb-4">
                <Button
                  variant="outlined"
                  onClick={toggleStockColumns}
                  className="flex items-center gap-2"
                >
                  {showStockColumns ? "Ẩn tồn kho" : "Xem tồn kho"}
                </Button>
              </div>

              {/* Bảng chi tiết hàng */}
              <Table
                data={rows}                 // Mảng items từ state
                columnsConfig={columnsConfig}
                enableSelection={false}
                columnVisibilityModel={columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}      // Có cần chọn nhiều dòng không?
              />
              {/* <div className="border border-gray-200 rounded mb-4">
                Bật table-fixed để cố định chiều rộng
                <table className="table-fixed w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      Cố định width cho từng <th>
                      <th className=" w-5 px-2 py-2 text-sm font-semibold text-gray-600 border-r">
                        STT
                      </th>
                      <th className="w-28 px-2 py-2 text-sm font-semibold text-gray-600 border-r">
                        Mã hàng
                      </th>
                      <th className="w-32 px-2 py-2 text-sm font-semibold text-gray-600 border-r">
                        Tên hàng
                      </th>
                      <th className="w-8 px-2 py-2 text-sm font-semibold text-gray-600 border-r">
                        Đơn vị
                      </th>
                      <th className="w-10 px-2 py-2 text-sm font-semibold text-gray-600 border-r">
                        Số lượng
                      </th>
                      {showStockColumns && (
                        <>
                          <th className="w-12 px-2 py-2 text-sm font-semibold text-gray-600 border-r">
                            Số lượng<br/>tồn kho
                          </th>
                          <th className="w-12 px-2 py-2 text-sm font-semibold text-gray-600 border-r">
                            Số lượng<br/>muốn sử dụng
                          </th>
                        </>
                      )}
                      <th className="w-12 px-2 py-2 text-sm font-semibold text-gray-600 border-r">
                        Số lượng<br/>cần sản xuất
                      </th>
                      
                      <th className="w-16 px-2 py-2 text-sm font-semibold text-gray-600">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length > 0 ? (
                      items.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b last:border-b-0 hover:bg-gray-50"
                        >
                          <td className="px-2 py-2 text-sm text-gray-700 border-r text-left">
                            {index + 1}
                          </td>
                          Mã hàng (chọn từ dropdown)
                          <td className="px-2 py-2 text-sm border-r">
                            <Select
                              placeholder="Chọn sản phẩm"
                              isSearchable
                              options={products}
                              styles={customStyles}
                              // Giảm bớt chiều rộng dropdown
                              className="w-28 text-sm"
                              value={
                                products.find((p) => p.value === item.productCode) ||
                                null
                              }
                              onChange={(selectedOption) =>
                                handleSelectProduct(item.id, selectedOption)
                              }
                              isDisabled={!isEditing}
                            />
                            {itemsErrors[item.id]?.productError && (
                              <Typography color="red" className="text-xs mt-1">
                                {itemsErrors[item.id].productError}
                              </Typography>
                            )}
                          </td>
                          Tên hàng
                          <td className="px-2 py-2 text-sm border-r">
                            <Input
                              className=" text-sm"
                              value={item.productName}
                              disabled
                            />
                          </td>
                          Đơn vị
                          <td className="px-2 py-2 text-sm border-r">
                            <Input
                              className="w-14 text-sm"
                              value={item.unitName}
                              disabled
                            />
                          </td>
                          Số lượng
                          <td className="px-2 py-2 text-sm border-r">
                            <Input
                              type="number"
                              className="w-14 text-sm"
                              value={item.quantity}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              disabled={!isEditing}
                            />
                            {itemsErrors[item.id]?.quantityError && (
                              <Typography color="red" className="text-xs mt-1">
                                {itemsErrors[item.id].quantityError}
                              </Typography>
                            )}
                          </td>
                          {showStockColumns && (
                            <>
                              <td className="px-2 py-2 text-sm border-r">
                                <Input
                                  type="number"
                                  className="w-14 text-sm"
                                  value={item.inStock}
                                  onChange={(e) => handleInStockChange(item.id, e.target.value)}
                                  disabled={!isEditing}
                                />
                              </td>
                              <td className="px-2 py-2 text-sm border-r">
                                <Input
                                  type="number"
                                  className="w-14 text-sm"
                                  value={item.usedQuantity}
                                  onChange={(e) => handleUsedQuantityChange(item.id, e.target.value)}
                                  disabled={!isEditing}
                                />
                              </td>
                            </>
                          )}
                          Số lượng cần sản xuất
                          <td className="px-2 py-2 text-sm border-r">
                            <Input
                              type="number"
                              className="w-14 text-sm"
                              value={item.produceQuantity}
                              onChange={(e) =>
                                handleProduceQuantityChange(item.id, e.target.value)
                              }
                              disabled={!isEditing}
                            />
                          </td>
                          
                          Thao tác
                          <td className="px-2 py-2 text-sm text-center">
                            {isEditing && (
                              <Button
                                color="red"
                                variant="text"
                                size="sm"
                                onClick={() => handleDeleteRow(item.id)}
                              >
                                Xóa
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="px-4 py-2 text-center text-gray-500">
                          Chưa có dòng sản phẩm nào
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div> */}

              {/* Nút thêm / xóa dòng (chỉ hiển thị khi đang chỉnh sửa) */}
              {isEditing && (
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

          {/* Thông báo lỗi và nút Lưu / Hủy / Chỉnh sửa */}
          <div className="flex flex-col gap-2">
            {globalError && (
              <Typography color="red" className="text-sm text-right">
                {globalError}
              </Typography>
            )}
            <div className="flex justify-end gap-2">
              {/* Nếu đang chỉnh sửa => nút Hủy, nếu không => Quay lại */}
              <Button
                variant="text"
                color="gray"
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <FaTimes />
                {isEditing ? "Hủy" : "Quay lại"}
              </Button>

              {/* Nút Chỉnh sửa / Lưu */}
              {!isEditing ? (
                <Button
                  variant="gradient"
                  color="blue"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <FaEdit /> Chỉnh sửa
                </Button>
              ) : (
                <Button
                  variant="gradient"
                  color="green"
                  onClick={handleSaveOrder}
                  className="flex items-center gap-2"
                >
                  <FaSave /> Lưu
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Popup thêm khách hàng */}
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
