import { FaSave, FaArrowLeft, FaEdit, FaPlus, FaTrash, FaEye, FaCheck } from "react-icons/fa";
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
import { TextField, Button as MuiButton } from '@mui/material';
import { Tab, Tabs } from '@mui/material';
import Select, { components } from "react-select";
import dayjs from "dayjs";
import useSaleOrder from "./useSaleOrder";
import { getPartnersByType, getPartnersByMaterial } from "@/features/user/partner/partnerService";
import {
  getProducts,
  getSaleOrderById,
  getTotalQuantityOfProduct,
  getProductMaterialsByProduct,
  cancelSaleOrder,
} from "./saleOrdersService";
import ModalAddCustomer from "./ModalAddCustomer";
import PageHeader from "@/components/PageHeader";
import { canCreatePurchaseRequest } from "@/features/user/purchaseRequest/PurchaseRequestService"
import CancelSaleOrderModal from "./CancelSaleOrderModal";


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
  menuPortal: (provided) => ({
    ...provided,
    zIndex: 9999, // Đảm bảo dropdown hiển thị trên tất cả các phần tử khác
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
  const [showCancelModal, setShowCancelModal] = useState(false);



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

  // Lỗi định mức NVL cho từng sản phẩm
  const [materialErrors, setMaterialErrors] = useState({});

  // Tab hiển thị
  const [activeTab, setActiveTab] = useState("info");

  // Lưu dữ liệu ban đầu (để revert)
  const [originalData, setOriginalData] = useState(null);

  // -------------- 3 MODE: view / edit / dinhMuc ---------------
  const [mode, setMode] = useState(MODE_VIEW);
  const selectRef = useRef(null);
  const [nextId, setNextId] = useState(1);

  // State để hiển thị bảng định mức nguyên vật liệu bên dưới bảng sản phẩm
  const [showMaterialTable, setShowMaterialTable] = useState(false);

  // State lưu kết quả định mức nguyên vật liệu (tính theo: material của 1 product * số product cần SX)
  const [materialRequirements, setMaterialRequirements] = useState([]);

  // Thêm state để lưu kết quả kiểm tra khả năng tạo PurchaseRequest
  const [canCreatePurchaseRequestState, setCanCreatePurchaseRequestState] = useState(false);

  // Gọi API từ service để kiểm tra khả năng tạo PurchaseRequest
  useEffect(() => {
    const checkCanCreatePurchaseRequest = async () => {
      if (orderId) {
        try {
          const canCreate = await canCreatePurchaseRequest(orderId);
          setCanCreatePurchaseRequestState(canCreate);
        } catch (error) {
          console.error("Lỗi khi kiểm tra khả năng tạo yêu cầu mua vật tư:", error);
          setCanCreatePurchaseRequestState(false); // Mặc định ẩn nút nếu có lỗi
          setGlobalError("Không thể kiểm tra trạng thái yêu cầu mua vật tư. Vui lòng thử lại sau.");
        }
      }
    };

    checkCanCreatePurchaseRequest();
  }, [orderId]);


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

        // Map orderDetails => items, ban đầu dùng tổng tồn kho (số) cho mode VIEW/EDIT
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
              inStock: totalQuantity ?? detail.inStock ?? 0,
              usedQuantity: detail.usedQuantity ?? 0,
              produceQuantity: (detail.quantity ?? 0) - (detail.usedQuantity ?? 0),
            };
          })
        );
        setItems(loadedItems);
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
          rejectionReason: orderData.rejectionReason || "",
          statusLabel: orderData.statusLabel || "Không rõ",
          status: orderData.status || "",
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

  // Thay thế logic chỉnh sửa từ phiên bản trên main
  const handleEdit = () => {
    if (!originalData) return;
    handleSetMode(MODE_EDIT);
  };

  // Khi chuyển sang chế độ DINHMUC, cập nhật từng item với inStock là mảng chi tiết tồn kho
  const handleXemDinhMuc = async () => {
    const updatedItems = await Promise.all(
      items.map(async (item) => {
        let details = [];
        try {
          details = await getTotalQuantityOfProduct(item.productId);
          details = details.map((d) => ({
            ...d,
            usedQuantity: details.length === 1 ? item.usedQuantity : 0,
          }));
        } catch (error) {
          console.warn(`Không lấy được tồn kho cho sản phẩm ${item.productId}`);
        }
        const totalUsed = details.reduce((sum, d) => sum + d.usedQuantity, 0);
        return { ...item, inStock: details, produceQuantity: item.quantity - totalUsed };
      })
    );
    setItems(updatedItems);
    handleSetMode(MODE_DINHMUC);
    // Hiển thị bảng định mức ngay khi xem định mức
    setShowMaterialTable(true);

    // Kiểm tra định mức NVL cho từng sản phẩm
    const newMaterialErrors = {};
    await Promise.all(
      updatedItems.map(async (item) => {
        if (item.productId) {
          try {
            const materials = await getProductMaterialsByProduct(item.productId);
            if (!materials || materials.length === 0) {
              newMaterialErrors[item.id] = `Mã SP ${item.productCode} chưa có định mức NVL`;
            }
          } catch (error) {
            console.error("Lỗi khi kiểm tra định mức NVL:", error);
            newMaterialErrors[item.id] = `Mã SP ${item.productCode} chưa có định mức NVL`;
          }
        }
      })
    );
    setMaterialErrors(newMaterialErrors);
  };

  // Cập nhật SL muốn dùng cho từng kho, giới hạn không vượt quá số lượng tồn kho của kho và số lượng còn lại của đơn
  const handleDetailUsedQuantityChange = (itemId, detailIndex, val) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newUsedInput = Number(val);
          const othersUsed = item.inStock.reduce(
            (sum, d, idx) => (idx === detailIndex ? sum : sum + d.usedQuantity),
            0
          );
          const allowedFromOrder = item.quantity - othersUsed;
          const currentDetail = item.inStock[detailIndex];
          const availableInDetail = currentDetail ? currentDetail.quantity : 0;
          const validUsed = Math.min(newUsedInput, allowedFromOrder, availableInDetail);
          const newDetails = item.inStock.map((d, idx) =>
            idx === detailIndex ? { ...d, usedQuantity: validUsed } : d
          );
          const totalUsed = newDetails.reduce((sum, d) => sum + d.usedQuantity, 0);
          return { ...item, inStock: newDetails, produceQuantity: item.quantity - totalUsed };
        }
        return item;
      })
    );
    setGlobalError("");
  };
  const handleCancelSaleOrder = async (reason) => {
    try {
      await cancelSaleOrder(orderId, reason);
      alert("Đơn hàng đã được hủy.");
      navigate("/user/sale-orders");
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      alert("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
    }
  };


  const handleCancelEdit = () => {
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
    setMaterialErrors({}); // Reset lỗi định mức NVL
    handleSetMode(MODE_VIEW);
  };

  const handleCancel = () => {
    if (mode === MODE_EDIT) {
      handleCancelEdit();
    } else if (mode === MODE_DINHMUC) {
      setMaterialErrors({}); // Reset lỗi định mức NVL
      handleSetMode(MODE_VIEW);
    } else {
      navigate("/user/sale-orders");
    }
  };

  const handleCustomerChange = (selectedOption) => {
    setPartnerId(selectedOption?.id || null);
    setCustomerCode(selectedOption?.code || "");
    setCustomerName(selectedOption?.name || "");
    setAddress(selectedOption?.address || "");
    setPhoneNumber(selectedOption?.phone || "");
    if (selectedOption?.code) setCustomerError("");
  };

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
    setMaterialErrors({}); // Reset lỗi định mức NVL
    setGlobalError("");
  };

  const handleDeleteRow = (rowId) => {
    setItems((prev) => prev.filter((r) => r.id !== rowId));
    setMaterialErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[rowId];
      return newErrors;
    });
  };

  const handleSelectProduct = async (rowId, opt) => {
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

    // Kiểm tra định mức NVL khi chọn sản phẩm mới (chỉ trong MODE_DINHMUC)
    if (mode === MODE_DINHMUC && opt.productId) {
      try {
        const materials = await getProductMaterialsByProduct(opt.productId);
        setMaterialErrors((prev) => {
          const newErrors = { ...prev };
          if (!materials || materials.length === 0) {
            newErrors[rowId] = `Mã SP ${opt.value} chưa có định mức NVL`;
          } else {
            delete newErrors[rowId];
          }
          return newErrors;
        });
      } catch (error) {
        console.error("Lỗi khi kiểm tra định mức NVL:", error);
        setMaterialErrors((prev) => ({
          ...prev,
          [rowId]: `Mã SP ${opt.value} chưa có định mức NVL`,
        }));
      }
    }
  };

  const handleQuantityChange = (rowId, val) => {
    setItems((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          const newQuantity = Number(val);
          let totalUsed = 0;
          if (Array.isArray(r.inStock)) {
            totalUsed = r.inStock.reduce((sum, d) => sum + d.usedQuantity, 0);
          } else {
            totalUsed = r.usedQuantity;
          }
          return { ...r, quantity: newQuantity, produceQuantity: newQuantity - totalUsed };
        }
        return r;
      })
    );
    setGlobalError("");
  };

  const handleUsedQuantityChange = (rowId, val) => {
    setItems((prev) =>
      prev.map((r) => {
        if (r.id === rowId && !Array.isArray(r.inStock)) {
          const newUsed = Number(val);
          return { ...r, usedQuantity: newUsed, produceQuantity: r.quantity - newUsed };
        }
        return r;
      })
    );
    setGlobalError("");
  };

  // Giữ nguyên logic tạo yêu cầu mua vật tư từ phiên bản hiện tại của bạn
  const handleCreatePurchaseRequest = async () => {
    if (!orderId) {
      alert("Không tìm thấy đơn hàng để tạo yêu cầu mua vật tư!");
      return;
    }

    try {
      const materialRequirementsPromises = items.map(async (item) => {
        if (item.productId && item.produceQuantity > 0) {
          const materials = await getProductMaterialsByProduct(item.productId);
          return materials.map((mat) => ({
            id: `temp-${mat.materialId}-${item.productId}`,
            materialId: mat.materialId,
            materialCode: mat.materialCode,
            materialName: mat.materialName,
            unitName: mat.unitName,
            quantity: mat.quantity * item.produceQuantity,
          }));
        }
        return [];
      });

      const materialRequirements = (await Promise.all(materialRequirementsPromises)).flat();

      if (materialRequirements.length === 0) {
        alert("Không có vật tư nào cần mua từ đơn hàng này!");
        return;
      }

      const itemsWithSuppliers = await Promise.all(
        materialRequirements.map(async (item) => {
          const suppliers = await getPartnersByMaterial(item.materialId);
          const mappedSuppliers = suppliers.map((supplier) => ({
            value: supplier.partnerId,
            label: supplier.partnerName, // Chỉ hiển thị partnerName
            name: supplier.partnerName,
            code: supplier.partnerCode || "",
          }));

          const defaultSupplier = mappedSuppliers.length === 1 ? mappedSuppliers[0] : null;

          return {
            ...item,
            supplierId: defaultSupplier ? defaultSupplier.value : "",
            supplierName: defaultSupplier ? defaultSupplier.name : "", // Chỉ lưu partnerName
            suppliers: mappedSuppliers,
          };
        })
      );

      navigate("/user/purchase-request/add", {
        state: {
          fromSaleOrder: true,
          saleOrderId: orderId,
          saleOrderCode: orderCode,
          initialItems: itemsWithSuppliers,
        },
      });
    } catch (error) {
      console.error("Lỗi khi chuẩn bị dữ liệu yêu cầu mua vật tư:", error);
      alert("Có lỗi xảy ra khi chuẩn bị dữ liệu yêu cầu mua vật tư!");
    }
  };

  // Thay thế logic lưu đơn hàng từ phiên bản trên main
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
      status: "PROCESSING",
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

  // Thay thế logic render bảng sản phẩm từ phiên bản trên main
  const renderTableRows = () => {
    if (items.length === 0) {
      return (
        <tr>
          <td
            colSpan={mode === MODE_EDIT ? 10 : mode === MODE_DINHMUC ? 10 : 5}
            className="px-4 py-2 text-center text-gray-500"
          >
            Chưa có dòng sản phẩm nào
          </td>
        </tr>
      );
    }
    if (mode === MODE_DINHMUC) {
      return items.flatMap((item, idx) => {
        const details =
          Array.isArray(item.inStock) && item.inStock.length > 0
            ? item.inStock
            : [{ warehouseName: "", quantity: 0, usedQuantity: 0 }];
        const totalUsed = details.reduce((sum, d) => sum + d.usedQuantity, 0);
        return details.map((detail, detailIndex) => (
          <tr key={`${item.id}-${detailIndex}`} className="border-b last:border-b-0 hover:bg-gray-50">
            {detailIndex === 0 && (
              <>
                <td className="px-4 py-2 text-sm text-gray-700 border-r" rowSpan={details.length}>
                  {idx + 1}
                </td>
                <td className="px-4 py-2 text-sm border-r" rowSpan={details.length}>
                  <Select
                    placeholder="Chọn sản phẩm"
                    isSearchable
                    options={products}
                    styles={customStyles}
                    className="w-52"
                    value={products.find((p) => p.value === item.productCode) || null}
                    onChange={(sel) => handleSelectProduct(item.id, sel)}
                    isDisabled={mode !== MODE_EDIT}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                  {itemsErrors[item.id]?.productError && (
                    <Typography color="red" className="text-xs mt-1">
                      {itemsErrors[item.id].productError}
                    </Typography>
                  )}
                  {materialErrors[item.id] && (
                    <Typography color="red" className="text-xs mt-1">
                      {materialErrors[item.id]}
                    </Typography>
                  )}
                </td>
                <td className="px-4 py-2 text-sm border-r" rowSpan={details.length}>
                  <Input className="w-32 text-sm" value={item.productName} disabled />
                </td>
                <td className="px-4 py-2 text-sm border-r" rowSpan={details.length}>
                  <Input className="w-16 text-sm" value={item.unitName} disabled />
                </td>
                <td className="px-4 py-2 text-sm border-r" rowSpan={details.length}>
                  <Input
                    type="number"
                    className="w-12 text-sm"
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
              </>
            )}
            <td className="px-4 py-2 text-sm border-r">{detail.warehouseName}</td>
            <td className="px-4 py-2 text-sm border-r">
              <Input type="number" className="w-12 text-sm" value={detail.quantity || 0} disabled />
            </td>
            <td className="px-4 py-2 text-sm border-r">
              <Input
                type="number"
                className="w-12 text-sm"
                value={detail.usedQuantity || 0}
                onChange={(e) =>
                  handleDetailUsedQuantityChange(item.id, detailIndex, e.target.value)
                }
              />
            </td>
            {detailIndex === 0 && (
              <td className="px-4 py-2 text-sm border-r" rowSpan={details.length}>
                <Input type="number" className="w-12 text-sm" value={item.produceQuantity || 0} disabled />
              </td>
            )}
            {detailIndex === 0 && mode === MODE_EDIT && (
              <td className="px-4 py-2 text-sm text-center" rowSpan={details.length}>
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
      });
    } else {
      return items.map((item, idx) => (
        <tr key={item.id} className="border-b last:border-b-0 hover:bg-gray-50">
          <td className="px-4 py-2 text-sm text-gray-700 border-r">{idx + 1}</td>
          <td className="px-4 py-2 text-sm border-r">
            <Select
              placeholder="Chọn sản phẩm"
              isSearchable
              options={products}
              styles={customStyles}
              className="w-52"
              value={products.find((p) => p.value === item.productCode) || null}
              onChange={(sel) => handleSelectProduct(item.id, sel)}
              isDisabled={mode !== MODE_EDIT}
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
            {itemsErrors[item.id]?.productError && (
              <Typography color="red" className="text-xs mt-1">
                {itemsErrors[item.id].productError}
              </Typography>
            )}
            {materialErrors[item.id] && mode === MODE_DINHMUC && (
              <Typography color="red" className="text-xs mt-1">
                {materialErrors[item.id]}
              </Typography>
            )}
          </td>
          <td className="px-4 py-2 text-sm border-r">
            <Input className="w-32 text-sm" value={item.productName} disabled />
          </td>
          <td className="px-4 py-2 text-sm border-r">
            <Input className="w-16 text-sm" value={item.unitName} disabled />
          </td>
          <td className="px-4 py-2 text-sm border-r">
            <Input
              type="number"
              className="w-12 text-sm"
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
          {mode === MODE_DINHMUC && (
            <>
              <td className="px-4 py-2 text-sm border-r">
                <Input type="number" className="w-12 text-sm" value={item.inStock || 0} disabled />
              </td>
              <td className="px-4 py-2 text-sm border-r">
                <Input
                  type="number"
                  className="w-12 text-sm"
                  value={item.usedQuantity || 0}
                  onChange={(e) => handleUsedQuantityChange(item.id, e.target.value)}
                />
              </td>
              <td className="px-4 py-2 text-sm border-r">
                <Input
                  type="number"
                  className="w-12 text-sm"
                  value={item.produceQuantity || 0}
                  disabled
                />
              </td>
            </>
          )}
          {mode === MODE_EDIT && (
            <td className="px-4 py-2 text-sm text-center">
              <Button color="red" variant="text" size="sm" onClick={() => handleDeleteRow(item.id)}>
                Xóa
              </Button>
            </td>
          )}
        </tr>
      ));
    }
  };

  // ===== TÍNH TOÁN NGUYÊN VẬT LIỆU DỰA VÀO SỐ SX =====
  // Khi ở chế độ DINHMUC và bảng NVL đang hiển thị, mỗi khi items thay đổi thì tính lại định mức
  useEffect(() => {
    if (mode === MODE_DINHMUC && showMaterialTable) {
      const recalcMaterialRequirements = async () => {
        const promises = items.map(async (item) => {
          if (item.productId && item.produceQuantity > 0) {
            try {
              const materials = await getProductMaterialsByProduct(item.productId);
              if (!materials || materials.length === 0) {
                setMaterialErrors((prev) => ({
                  ...prev,
                  [item.id]: `Mã SP ${item.productCode} chưa có định mức NVL`,
                }));
                return null;
              }
              return { produceQuantity: item.produceQuantity, materials };
            } catch (error) {
              console.error("Error fetching materials for product", item.productId, error);
              setMaterialErrors((prev) => ({
                ...prev,
                [item.id]: `Mã SP ${item.productCode} chưa có định mức NVL`,
              }));
              return null;
            }
          }
          return null;
        });
        const results = await Promise.all(promises);
        let aggregated = {};
        results.forEach((result) => {
          if (result && result.materials) {
            result.materials.forEach((mat) => {
              const requiredQty = mat.quantity * result.produceQuantity;
              if (aggregated[mat.materialCode]) {
                aggregated[mat.materialCode].requiredQuantity += requiredQty;
              } else {
                aggregated[mat.materialCode] = {
                  materialCode: mat.materialCode,
                  materialName: mat.materialName,
                  requiredQuantity: requiredQty,
                  unitName: mat.unitName,
                };
              }
            });
          }
        });
        setMaterialRequirements(Object.values(aggregated));
      };
      recalcMaterialRequirements();
    }
  }, [items, mode, showMaterialTable]);

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
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab label="Thông tin đơn hàng" value="info" />
              <Tab label="Danh sách sản phẩm" value="products" />
            </Tabs>
          </div>

          {activeTab === "info" && (
            <div className="flex flex-col gap-6 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
                    Mã đơn
                  </Typography>
                  <Input label="Mã đơn" value={orderCode} disabled className="text-sm" />
                </div>
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
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
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
                    Trạng thái đơn hàng
                  </Typography>
                  <Input label="Trạng thái" value={originalData?.statusLabel || "Không rõ"} disabled />
                </div>
              </div>
              {originalData?.status === "CANCELLED" && (
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
                    Lý do huỷ đơn hàng
                  </Typography>
                  <Textarea
                    value={originalData?.rejectionReason?.trim() || "Không có"}
                    disabled
                    className="text-sm disabled:opacity-100 disabled:font-normal disabled:text-black"
                  />
                </div>
              )}
              <div>
                <Typography variant="small" className="mb-2 font-bold text-gray-900">
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
              <Typography variant="h6" className="mt-4 mb-2 pb-2 font-bold text-gray-900 border-b">
                Thông tin khách hàng
              </Typography>
              <div className="grid grid-cols-2 gap-4">
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
                    onAddCustomer={() => setIsCreatePartnerPopupOpen(true)}
                    isDisabled={mode !== MODE_EDIT}
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                  {customerError && (
                    <Typography color="red" className="text-xs mt-1">
                      {customerError}
                    </Typography>
                  )}
                </div>
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
                    Tên khách hàng
                  </Typography>
                  <Input label="Tên khách hàng" value={customerName} disabled className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
                    Địa chỉ
                  </Typography>
                  <Input label="Địa chỉ" value={address} disabled className="text-sm" />
                </div>
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
                    Số điện thoại
                  </Typography>
                  <Input label="Số điện thoại" value={phoneNumber} disabled className="text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Typography variant="small" className="mb-2 font-bold text-gray-900">
                    Người liên hệ
                  </Typography>
                  <Input value={contactName} onChange={(e) => setContactName(e.target.value)} className="text-sm" disabled />
                </div>
              </div>
            </div>
          )}

          {activeTab === "products" && (
            <div>
              {mode === MODE_VIEW && (
                <div className="flex justify-end mb-4">
                  <MuiButton
                    color="info"
                    size="medium"
                    variant="outlined"
                    sx={{
                      color: '#616161',           // text color
                      borderColor: '#9e9e9e',     // border
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        borderColor: '#757575',
                      },
                    }}
                    onClick={handleXemDinhMuc}
                    className="flex items-center gap-2"
                  >
                    <FaEye className="h-3 w-3" /> Xem định mức
                  </MuiButton>
                </div>
              )}
              <div className="border border-gray-200 rounded mb-4 overflow-x-auto">
                <table className="w-full text-left min-w-max border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">STT</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">Mã hàng</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">Tên hàng</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">Đơn vị</th>
                      <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">Số lượng</th>
                      {mode === MODE_DINHMUC && (
                        <>
                          <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">Tên kho</th>
                          <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">Tồn kho</th>
                          <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">SL muốn dùng</th>
                          <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">SL cần SX</th>
                        </>
                      )}
                      {mode === MODE_EDIT && activeTab === "products" && (
                        <th className="px-4 py-2 text-sm font-semibold text-gray-600">Thao tác</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>{renderTableRows()}</tbody>
                </table>
              </div>
              {mode === MODE_EDIT && activeTab === "products" && (
                <div className="flex gap-2 mb-4">
                  <Button variant="outlined" onClick={handleAddRow} className="flex items-center gap-2">
                    <FaPlus /> Thêm dòng
                  </Button>
                  <Button variant="outlined" color="red" onClick={handleRemoveAllRows} className="flex items-center gap-2">
                    <FaTrash /> Xóa hết dòng
                  </Button>
                </div>
              )}
              {/* Bảng định mức nguyên vật liệu sẽ xuất hiện ngay bên dưới bảng sản phẩm khi đã xem định mức */}
              {mode === MODE_DINHMUC && showMaterialTable && (
                <div className="mt-4">
                  <Typography variant="h6" className="mb-2 text-gray-900">
                    Định mức nguyên vật liệu
                  </Typography>
                  <table className="w-full text-left min-w-max border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">Mã NVL</th>
                        <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">Tên NVL</th>
                        <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">Số lượng</th>
                        <th className="px-4 py-2 text-sm font-semibold text-gray-600 border-r">Đơn vị</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialRequirements.length > 0 ? (
                        materialRequirements.map((mat, index) => (
                          <tr key={index} className="border-b last:border-b-0 hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm border-r">{mat.materialCode}</td>
                            <td className="px-4 py-2 text-sm border-r">{mat.materialName}</td>
                            <td className="px-4 py-2 text-sm border-r">{mat.requiredQuantity}</td>
                            <td className="px-4 py-2 text-sm border-r">{mat.unitName}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-4 py-2 text-sm text-gray-500">
                            Không có nguyên vật liệu nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {globalError && (
              <Typography color="red" className="text-sm text-right">
                {globalError}
              </Typography>
            )}
            <div className="flex justify-between mt-2">
              <MuiButton
                color="info"
                size="medium"
                variant="outlined"
                sx={{
                  color: '#616161',
                  borderColor: '#9e9e9e',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#757575',
                  },
                }}
                onClick={handleCancel}
                className="flex items-center gap-2"
              >
                <FaArrowLeft className="h-3 w-3" /> Quay lại
              </MuiButton>
              {mode === MODE_VIEW && originalData?.statusLabel !== "Đã huỷ" && activeTab === "info" && (
                <Button
                  size="lg"
                  color="red"
                  variant="outlined"
                  className="ml-2"
                  onClick={() => setShowCancelModal(true)}
                >
                  Huỷ đơn hàng
                </Button>
              )}



              {mode === MODE_VIEW && activeTab === "products" && canCreatePurchaseRequestState && originalData?.status !== "CANCELLED" && (
                <MuiButton
                  variant="contained"
                  size="medium"
                  onClick={handleEdit}
                  sx={{
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' }
                  }}
                >
                  <div className='flex items-center gap-2'>
                    <FaEdit className="h-4 w-4" />
                    <span>Chỉnh sửa</span>
                  </div>
                </MuiButton>
              )}


              {mode === MODE_EDIT && (
                <div className="flex items-center gap-2">
                  <MuiButton
                    size="medium"
                    color="error"
                    variant="outlined"
                    onClick={handleCancel}
                  >
                    Hủy
                  </MuiButton>
                  <Button
                    size="lg"
                    color="white"
                    variant="text"
                    className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 rounded-[4px] transition-all duration-200 ease-in-out"
                    ripple={true}
                    onClick={handleSaveOrder}
                  >
                    Lưu
                  </Button>
                </div>
              )}

              {canCreatePurchaseRequestState && mode === MODE_DINHMUC && originalData?.status !== "CANCELLED" && (
                <Button
                  size="lg"
                  color="white"
                  variant="text"
                  className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 rounded-[4px] transition-all duration-200 ease-in-out"
                  ripple={true}
                  onClick={handleCreatePurchaseRequest}
                >
                  <div className="flex items-center gap-2">
                    <FaCheck />
                    <span>Tạo yêu cầu mua vật tư</span>
                  </div>
                </Button>
              )}
            </div>

            {/* <div className="flex justify-end gap-2">
              <Button variant="text" color="gray" onClick={handleCancel} className="flex items-center gap-2">
                {mode === MODE_EDIT ? "Hủy" : "Quay lại"}
              </Button>
              {mode === MODE_VIEW && activeTab === "products" && (
                <Button variant="gradient" color="blue" onClick={handleEdit} className="flex items-center gap-2">
                  <FaEdit /> Chỉnh sửa
                </Button>
              )}
              {mode === MODE_EDIT && (
                <Button variant="gradient" color="green" onClick={handleSaveOrder} className="flex items-center gap-2">
                  <FaSave /> Lưu
                </Button>
              )}
              {mode === MODE_DINHMUC && (
                <Button variant="gradient" color="green" onClick={handleCreatePurchaseRequest} className="flex items-center gap-2">
                  <FaCheck /> Tạo yêu cầu mua vật tư
                </Button>
              )}
            </div> */}
          </div>
        </CardBody>
      </Card>

      {showCancelModal && (
        <CancelSaleOrderModal
          open={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelSaleOrder}
        />
      )}

      {isCreatePartnerPopupOpen && (
        <ModalAddCustomer
          onClose={() => setIsCreatePartnerPopupOpen(false)}
          onSuccess={() => {
            setIsCreatePartnerPopupOpen(false);
            fetchCustomers();
          }}
        />
      )}
    </div>
  );
};

export default EditSaleOrderPage;