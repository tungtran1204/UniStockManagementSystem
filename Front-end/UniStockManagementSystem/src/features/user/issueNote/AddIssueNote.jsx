import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Button
} from "@material-tailwind/react";
import {
  TextField,
  MenuItem,
  Autocomplete,
  IconButton,
  Button as MuiButton,
  Tooltip, 
  Divider
} from '@mui/material';
import {
  HighlightOffRounded,
  ClearRounded
} from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { FaPlus, FaTrash, FaArrowLeft, FaSearch } from "react-icons/fa";
import {
  ArrowLeftIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

import PageHeader from "@/components/PageHeader";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // Import Tiếng Việt

import FileUploadBox from "@/components/FileUploadBox";
import ModalAddPartner from "./ModalAddPartner";
import ModalChooseOrder from "./ModalChooseOrder";
import TableSearch from "@/components/TableSearch";

import { getPartnersByType } from "@/features/user/partner/partnerService";
import { getSaleOrders, uploadPaperEvidence } from "./issueNoteService";
import { getTotalQuantityOfMaterial } from "./issueNoteService";
import { getTotalQuantityOfProduct } from "../saleorders/saleOrdersService";
import { getProducts } from "../saleorders/saleOrdersService"; // Giả định có service này để lấy danh sách sản phẩm

import useIssueNote from "./useIssueNote";

const OUTSOURCE_TYPE_ID = 3;
const SUPPLIER_TYPE_ID = 2;

const AddIssueNote = () => {
  const navigate = useNavigate();
  const { fetchNextCode, addIssueNote, materials } = useIssueNote();

  // ------------------ STATE: Thông tin chung ------------------
  const [issueNoteCode, setIssueNoteCode] = useState("");
  const [category, setCategory] = useState("");
  const [createdDate, setCreateDate] = useState("");
  const [description, setDescription] = useState("");
  const [referenceDocument, setReferenceDocument] = useState("");
  const [files, setFiles] = useState([]);
  const [contactName, setContactName] = useState("");
  const [address, setAddress] = useState("");
  const [partnerCode, setPartnerCode] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerId, setPartnerId] = useState(null);
  const [soId, setSoId] = useState(null);

  // ------------------ STATE: Modal Đơn hàng ------------------
  const [orders, setOrders] = useState([]);
  const [isChooseOrderModalOpen, setIsChooseOrderModalOpen] = useState(false);

  // ------------------ STATE: Đối tác (gia công, NCC) ------------------
  const [outsources, setOutsources] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isCreatePartnerPopupOpen, setIsCreatePartnerPopupOpen] = useState(false);

  // ------------------ STATE: Danh sách sản phẩm / Nguyên vật liệu ------------------
  const [products, setProducts] = useState([]);
  const [productList, setProductList] = useState([]); // Thêm state để lưu danh sách sản phẩm

  // ------------------ Lấy mã phiếu + đặt ngày mặc định ------------------
  useEffect(() => {
    (async () => {
      try {
        const code = await fetchNextCode();
        setIssueNoteCode(code || "");
      } catch (err) {
        console.error("Lỗi khi fetchNextCode:", err);
      }
    })();
    if (!createdDate) {
      setCreateDate(dayjs().format("YYYY-MM-DD"));
    }
  }, []);

  // ------------------ Lấy DS đơn hàng, nếu category = "Bán hàng" ------------------
  const fetchOrders = async () => {
    try {
      const response = await getSaleOrders();
      if (response && response.content) {
        const mapped = response.content
          .filter(order => ["PREPARING_MATERIAL", "PARTIALLY_ISSUED"].includes(order.status))
          .map((order) => ({
            id: order.orderId,
            orderCode: order.orderCode,
            orderName: order.partnerName,
            partnerCode: order.partnerCode,
            partnerName: order.partnerName,
            orderDate: order.orderDate,
            address: order.address,
            contactName: order.contactName,
            orderDetails: order.orderDetails,
          }));
        setOrders(mapped);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Lỗi fetchOrders:", error);
      setOrders([]);
    }
  };

  // ------------------ Lấy DS sản phẩm ------------------
  const fetchProducts = async () => {
    try {
      const response = await getProducts(); // Giả định có API này
      if (response && response.content) {
        const mapped = response.content.map((prod) => ({
          id: prod.productId,
          code: prod.productCode,
          name: prod.productName,
          unitName: prod.unitName,
          unitId: prod.unitId,
          type: 'product'
        }));
        setProductList(mapped);
      } else {
        setProductList([]);
      }
    } catch (error) {
      console.error("Lỗi fetchProducts:", error);
      setProductList([]);
    }
  };

  // ------------------ Lấy DS gia công, NCC ------------------
  const fetchOutsources = async () => {
    try {
      const res = await getPartnersByType(OUTSOURCE_TYPE_ID);
      if (!res || !res.partners) {
        console.error("API không trả về dữ liệu hợp lệ!");
        setOutsources([]);
        return;
      }
      const mapped = res.partners
        .map((o) => {
          const t = o.partnerTypes.find(
            (pt) => pt.partnerType.typeId === OUTSOURCE_TYPE_ID
          );
          return {
            id: o.partnerId,
            code: t?.partnerCode || "",
            label: `${t?.partnerCode || ""} - ${o.partnerName}`,
            name: o.partnerName,
            address: o.address,
            phone: o.phone,
            contactName: o.contactName,
          };
        })
        .filter((c) => c.code && c.code.toUpperCase().includes("ĐTGC"));
      setOutsources(mapped);
    } catch (err) {
      console.error("Lỗi fetchOutsources:", err);
      setOutsources([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await getPartnersByType(SUPPLIER_TYPE_ID);
      if (!res || !res.partners) {
        console.error("API không trả về dữ liệu hợp lệ!");
        setSuppliers([]);
        return;
      }
      const mapped = res.partners
        .map((s) => {
          const t = s.partnerTypes.find(
            (pt) => pt.partnerType.typeId === SUPPLIER_TYPE_ID
          );
          return {
            id: s.partnerId,
            code: t?.partnerCode || "",
            label: `${t?.partnerCode || ""} - ${s.partnerName}`,
            name: s.partnerName,
            address: s.address,
            phone: s.phone,
            contactName: s.contactName,
          };
        })
        .filter((c) => c.code !== "");
      setSuppliers(mapped);
    } catch (err) {
      console.error("Lỗi fetchSuppliers:", err);
      setSuppliers([]);
    }
  };

  // ------------------ Khi đổi category => fetch DS tương ứng ------------------
  useEffect(() => {
    if (category === "Bán hàng") {
      fetchOrders();
    }
    if (category === "Gia công") {
      fetchOutsources();
    }
    if (category === "Trả lại hàng mua") {
      fetchSuppliers();
    }
    if (category === "Sản xuất") {
      fetchProducts(); // Lấy danh sách sản phẩm khi category là Sản xuất
    }
    setReferenceDocument("");
    setSoId(null);
    setPartnerCode("");
    setPartnerName("");
    setPartnerId(null);
    setContactName("");
    setAddress("");
    setDescription("");
    setProducts([]);
    setFiles([]);
  }, [category]);

  // ------------------ Handle chọn đơn hàng ------------------
  const handleOpenChooseOrderModal = () => setIsChooseOrderModalOpen(true);
  const handleCloseChooseOrderModal = () => setIsChooseOrderModalOpen(false);

  const handleOrderSelected = async (selectedOrder) => {
    if (!selectedOrder) {
      setReferenceDocument("");
      setSoId(null);
      setPartnerCode("");
      setPartnerName("");
      setPartnerId(null);
      setCreateDate("");
      setDescription("");
      setAddress("");
      setContactName("");
      setProducts([]);
      return;
    }

    setReferenceDocument(selectedOrder.orderCode);
    setSoId(selectedOrder.id);
    setPartnerCode(selectedOrder.partnerCode);
    setPartnerName(selectedOrder.partnerName);
    setCreateDate(
      selectedOrder.orderDate
        ? dayjs(selectedOrder.orderDate).format("YYYY-MM-DD")
        : ""
    );
    setDescription(selectedOrder.orderName || "");
    setAddress(selectedOrder.address || "");
    setContactName(selectedOrder.contactName || "");

    // Tạo mảng products cho sản phẩm từ đơn hàng
    const newProducts = [];
    for (const detail of selectedOrder.orderDetails) {
      let inStockArr = [];
      try {
        if (detail.productId) {
          inStockArr = await getTotalQuantityOfProduct(detail.productId);
        }
      } catch (err) {
        console.error("Lỗi getTotalQuantityOfProduct:", err);
      }

      newProducts.push({
        id: `p-${detail.productId}-${Math.random()}`,
        productId: detail.productId,
        productCode: detail.productCode || "",
        productName: detail.productName || "",
        unitName: detail.unitName || "",
        unitId: detail.unitId,
        orderQuantity: detail.quantity || 0,
        exportedQuantity: detail.receivedQuantity || 0,
        pendingQuantity: (detail.quantity || 0) - (detail.receivedQuantity || 0),
        inStock: inStockArr && inStockArr.length > 0
          ? inStockArr.map((wh) => ({
              warehouseId: wh.warehouseId,
              warehouseName: wh.warehouseName || "",
              quantity: wh.quantity || 0,
              exportQuantity: 0,
              error: ""
            }))
          : [{
              warehouseId: null,
              warehouseName: " ",
              quantity: 0,
              exportQuantity: 0,
              error: ""
            }]
      });

      if (!inStockArr || inStockArr.length === 0) {
        console.warn(`Không có dữ liệu tồn kho cho sản phẩm có ID: ${detail.productId}`);
      }
    }
    console.log("New products set from selected order:", newProducts);
    setProducts(newProducts);
    handleCloseChooseOrderModal();
  };

  // ------------------ Mở popup thêm đối tác ------------------
  const handleOpenCreatePartnerPopup = () => setIsCreatePartnerPopupOpen(true);
  const handleCloseCreatePartnerPopup = () => setIsCreatePartnerPopupOpen(false);

  // ------------------ Thêm/Xoá dòng ------------------
  const handleAddRow = () => {
    if (category === "Trả lại hàng mua" || category === "Gia công") {
      setProducts((prev) => [
        ...prev,
        {
          id: `new-${prev.length + 1}`,
          materialId: null,
          materialCode: "",
          materialName: "",
          unitName: "",
          unitId: null,
          inventory: [{
            warehouseId: null,
            warehouseName: "",
            quantity: 0,
            exportQuantity: 0,
            error: ""
          }],
        },
      ]);
    } else if (category === "Sản xuất") {
      setProducts((prev) => [
        ...prev,
        {
          id: `new-${prev.length + 1}`,
          itemId: null,
          itemType: null,
          productCode: "",
          productName: "",
          unitName: "",
          unitId: null,
          inStock: [{
            warehouseId: null,
            warehouseName: "",
            quantity: 0,
            exportQuantity: 0,
            error: ""
          }],
        },
      ]);
    } else {
      setProducts((prev) => [
        ...prev,
        {
          id: `new-${prev.length + 1}`,
          productId: null,
          productCode: "",
          productName: "",
          unitName: "",
          unitId: null,
          orderQuantity: 1,
          exportedQuantity: 0,
          pendingQuantity: 1,
          inStock: [{
            warehouseId: null,
            warehouseName: "",
            quantity: 0,
            exportQuantity: 0,
            error: ""
          }],
        },
      ]);
    }
  };

  const handleRemoveAllRows = () => setProducts([]);
  const handleDeleteRow = (rowId) => {
    setProducts((prev) => prev.filter((p) => p.id !== rowId));
  };

  // ------------------ Pagination cho sản phẩm/NVL ------------------
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const totalPages = Math.ceil(products.length / pageSize);
  const totalElements = products.length;

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages - 1 : 0);
    }
  }, [products, totalPages, currentPage]);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  // ------------------ Hàm render bảng thống nhất ------------------
  const renderUnifiedTableBody = () => {
    const displayed = products.slice(
      currentPage * pageSize,
      (currentPage + 1) * pageSize
    );

    if (displayed.length === 0) {
      return (
        <tr>
          <td colSpan={category === "Bán hàng" ? 11 : 8} className="text-center py-3 text-gray-500">
            {category === "Gia công" ? "Chưa có nguyên vật liệu nào" : 
             category === "Sản xuất" ? "Chưa có sản phẩm/nguyên vật liệu nào" : 
             "Chưa có sản phẩm nào"}
          </td>
        </tr>
      );
    }

    if (category === "Gia công" || category === "Trả lại hàng mua") {
      return displayed.flatMap((nvl, nvlIndex) => {
        const inv = nvl.inventory && nvl.inventory.length > 0 
          ? nvl.inventory 
          : [{ warehouseId: null, warehouseName: "", quantity: 0, exportQuantity: 0, error: "" }];
        
        return inv.map((wh, whIndex) => {
          const isFirstRow = whIndex === 0;
          const rowSpan = inv.length;
          return (
            <tr key={`${nvl.id}-wh-${whIndex}`} className="border-b hover:bg-gray-50">
              {isFirstRow && (
                <>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-center text-sm">
                    {currentPage * pageSize + nvlIndex + 1}
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-sm">
                    <Autocomplete
                      options={materials || []}
                      getOptionLabel={(option) =>
                        `${option.materialCode} - ${option.materialName}`
                      }
                      value={materials.find(mat => mat.materialId === nvl.materialId) || null}
                      onChange={async (event, newValue) => {
                        if (newValue) {
                          try {
                            const inventoryData = await getTotalQuantityOfMaterial(newValue.materialId);
                            setProducts((prev) =>
                              prev.map((p) => {
                                if (p.id === nvl.id) {
                                  return {
                                    ...p,
                                    materialId: newValue.materialId,
                                    materialCode: newValue.materialCode,
                                    materialName: newValue.materialName,
                                    unitName: newValue.unitName,
                                    unitId: newValue.unitId,
                                    inventory: inventoryData && inventoryData.length > 0
                                      ? inventoryData.map((i) => ({
                                          warehouseId: i.warehouseId,
                                          warehouseName: i.warehouseName || "",
                                          quantity: i.quantity || 0,
                                          exportQuantity: 0,
                                          error: ""
                                        }))
                                      : [{
                                          warehouseId: null,
                                          warehouseName: " ",
                                          quantity: 0,
                                          exportQuantity: 0,
                                          error: ""
                                        }]
                                  };
                                }
                                return p;
                              })
                            );
                          } catch (error) {
                            console.error("Lỗi khi lấy tồn kho vật tư:", error);
                          }
                        } else {
                          setProducts((prev) =>
                            prev.map((p) => {
                              if (p.id === nvl.id) {
                                return {
                                  ...p,
                                  materialId: null,
                                  materialCode: "",
                                  materialName: "",
                                  unitName: "",
                                  unitId: null,
                                  inventory: [{
                                    warehouseId: null,
                                    warehouseName: " ",
                                    quantity: 0,
                                    exportQuantity: 0,
                                    error: ""
                                  }]
                                };
                              }
                              return p;
                            })
                          );
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Chọn NVL"
                          variant="outlined"
                          size="small"
                          color="success"
                        />
                      )}
                    />
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-sm">
                    {nvl.materialName}
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-sm">
                    {nvl.unitName}
                  </td>
                </>
              )}
              <td className="px-3 py-2 border-r text-sm">
                {wh.warehouseName || " "}
              </td>
              <td className="px-3 py-2 border-r text-sm text-right">{wh.quantity}</td>
              <td className="px-3 py-2 border-r text-sm w-24">
                <input
                  type="number"
                  className="border p-1 text-right w-[60px]"
                  value={wh.exportQuantity || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const maxAllowed = wh.quantity;
                    if (val > maxAllowed) {
                      setProducts((prev) =>
                        prev.map((p) => {
                          if (p.id === nvl.id) {
                            const newInv = p.inventory.map((invItem, i) => {
                              if (i === whIndex) {
                                return {
                                  ...invItem,
                                  error: `SL xuất không được vượt quá tồn kho (${maxAllowed}).`
                                };
                              }
                              return invItem;
                            });
                            return { ...p, inventory: newInv };
                          }
                          return p;
                        })
                      );
                      return;
                    }
                    setProducts((prev) =>
                      prev.map((p) => {
                        if (p.id === nvl.id) {
                          const newInv = p.inventory.map((invItem, i) => {
                            if (i === whIndex) {
                              return {
                                ...invItem,
                                exportQuantity: val,
                                error: ""
                              };
                            }
                            return invItem;
                          });
                          return { ...p, inventory: newInv };
                        }
                        return p;
                      })
                    );
                  }}
                />
                {wh.error && (
                  <div className="text-red-500 text-xs mt-1">{wh.error}</div>
                )}
              </td>
              {isFirstRow && (
                <td rowSpan={rowSpan} className="px-3 py-2 text-center text-sm">
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteRow(nvl.id)}
                    >
                      <HighlightOffRounded />
                    </IconButton>
                  </Tooltip>
                </td>
              )}
            </tr>
          );
        });
      });
    } else if (category === "Sản xuất") {
      const combinedItems = [
        ...(materials || []).map((mat) => ({
          id: mat.materialId,
          code: mat.materialCode,
          name: mat.materialName,
          unitName: mat.unitName,
          unitId: mat.unitId,
          type: 'material'
        })),
        ...(productList || []).map((prod) => ({
          id: prod.id,
          code: prod.code,
          name: prod.name,
          unitName: prod.unitName,
          unitId: prod.unitId,
          type: 'product'
        }))
      ];

      return displayed.flatMap((item, itemIndex) => {
        const inv = item.inStock && item.inStock.length > 0 
          ? item.inStock 
          : [{ warehouseId: null, warehouseName: "", quantity: 0, exportQuantity: 0, error: "" }];
        
        return inv.map((wh, whIndex) => {
          const isFirstRow = whIndex === 0;
          const rowSpan = inv.length;
          return (
            <tr key={`${item.id}-wh-${whIndex}`} className="border-b hover:bg-gray-50">
              {isFirstRow && (
                <>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-center text-sm">
                    {currentPage * pageSize + itemIndex + 1}
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-sm">
                    <Autocomplete
                      options={combinedItems}
                      getOptionLabel={(option) =>
                        `${option.code} - ${option.name} (${option.type === 'product' ? 'SP' : 'NVL'})`
                      }
                      value={combinedItems.find(opt => opt.id === item.itemId && opt.type === item.itemType) || null}
                      onChange={async (event, newValue) => {
                        if (newValue) {
                          try {
                            let inventoryData = [];
                            if (newValue.type === 'product') {
                              inventoryData = await getTotalQuantityOfProduct(newValue.id);
                            } else {
                              inventoryData = await getTotalQuantityOfMaterial(newValue.id);
                            }
                            setProducts((prev) =>
                              prev.map((p) => {
                                if (p.id === item.id) {
                                  return {
                                    ...p,
                                    itemId: newValue.id,
                                    itemType: newValue.type,
                                    productCode: newValue.code,
                                    productName: newValue.name,
                                    unitName: newValue.unitName || "",
                                    unitId: newValue.unitId,
                                    inStock: inventoryData && inventoryData.length > 0
                                      ? inventoryData.map((i) => ({
                                          warehouseId: i.warehouseId,
                                          warehouseName: i.warehouseName || "",
                                          quantity: i.quantity || 0,
                                          exportQuantity: 0,
                                          error: ""
                                        }))
                                      : [{
                                          warehouseId: null,
                                          warehouseName: " ",
                                          quantity: 0,
                                          exportQuantity: 0,
                                          error: ""
                                        }]
                                  };
                                }
                                return p;
                              })
                            );
                          } catch (error) {
                            console.error(`Lỗi khi lấy tồn kho ${newValue.type}:`, error);
                          }
                        } else {
                          setProducts((prev) =>
                            prev.map((p) => {
                              if (p.id === item.id) {
                                return {
                                  ...p,
                                  itemId: null,
                                  itemType: null,
                                  productCode: "",
                                  productName: "",
                                  unitName: "",
                                  unitId: null,
                                  inStock: [{
                                    warehouseId: null,
                                    warehouseName: " ",
                                    quantity: 0,
                                    exportQuantity: 0,
                                    error: ""
                                  }]
                                };
                              }
                              return p;
                            })
                          );
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder="Chọn SP/NVL"
                          variant="outlined"
                          size="small"
                          color="success"
                        />
                      )}
                    />
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-sm">
                    {item.productName}
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-sm">
                    {item.unitName}
                  </td>
                </>
              )}
              <td className="px-3 py-2 border-r text-sm">
                {wh.warehouseName || " "}
              </td>
              <td className="px-3 py-2 border-r text-sm w-24 text-center">{wh.quantity}</td>
              <td className="px-3 py-2 border-r text-sm w-40">
                <input
                  type="number"
                  className="border p-1 text-right w-[60px]"
                  value={wh.exportQuantity || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const maxAllowed = wh.quantity;
                    if (val > maxAllowed) {
                      setProducts((prev) =>
                        prev.map((p) => {
                          if (p.id === item.id) {
                            const newInStock = p.inStock.map((ins, i) => {
                              if (i === whIndex) {
                                return {
                                  ...ins,
                                  error: `SL xuất không được vượt quá tồn kho (${maxAllowed}).`
                                };
                              }
                              return ins;
                            });
                            return { ...p, inStock: newInStock };
                          }
                          return p;
                        })
                      );
                      return;
                    }
                    setProducts((prev) =>
                      prev.map((p) => {
                        if (p.id === item.id) {
                          const newInStock = p.inStock.map((ins, i) => {
                            if (i === whIndex) {
                              return {
                                ...ins,
                                exportQuantity: val,
                                error: ""
                              };
                            }
                            return ins;
                          });
                          return { ...p, inStock: newInStock };
                        }
                        return p;
                      })
                    );
                  }}
                />
                {wh.error && (
                  <div className="text-red-500 text-xs mt-1">{wh.error}</div>
                )}
              </td>
              {isFirstRow && (
                <td rowSpan={rowSpan} className="px-3 py-2 text-center text-sm w-24">
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteRow(item.id)}
                    >
                      <HighlightOffRounded />
                    </IconButton>
                  </Tooltip>
                </td>
              )}
            </tr>
          );
        });
      });
    } else { // Bán hàng
      return displayed.flatMap((prod, prodIndex) => {
        return (prod.inStock || []).map((wh, whIndex) => {
          const isFirstRow = whIndex === 0;
          const rowSpan = prod.inStock ? prod.inStock.length : 1;
          const maxExport =
            typeof wh.quantity === "number" &&
            typeof prod.pendingQuantity === "number"
              ? Math.min(wh.quantity, prod.pendingQuantity)
              : undefined;

          return (
            <tr key={`${prod.id}-wh-${whIndex}`} className="border-b hover:bg-gray-50">
              {isFirstRow && (
                <>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-center text-sm">
                    {currentPage * pageSize + (prodIndex + 1)}
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-sm">
                    {prod.productCode}
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-sm">
                    {prod.productName}
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-sm">
                    {prod.unitName}
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-center text-sm">
                    {prod.orderQuantity}
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-center text-sm">
                    {prod.exportedQuantity}
                  </td>
                  <td rowSpan={rowSpan} className="px-3 py-2 border-r text-center text-sm">
                    {prod.pendingQuantity}
                  </td>
                </>
              )}
              <td className="px-3 py-2 border-r text-sm">
                {wh.warehouseName || " "}
              </td>
              <td className="px-3 py-2 border-r text-sm text-right">{wh.quantity}</td>
              <td className="px-3 py-2 border-r text-sm w-24">
                <div>
                  <input
                    type="number"
                    className="border p-1 text-right w-[60px]"
                    value={wh.exportQuantity || 0}
                    max={maxExport}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (maxExport !== undefined && val > maxExport) {
                        setProducts((prev) =>
                          prev.map((p) => {
                            if (p.id === prod.id) {
                              const newInStock = p.inStock.map((ins, i) => {
                                if (i === whIndex) {
                                  return {
                                    ...ins,
                                    error: `Số lượng xuất không được vượt quá Tồn kho (${wh.quantity}) và SL còn phải xuất (${prod.pendingQuantity}).`
                                  };
                                }
                                return ins;
                              });
                              return { ...p, inStock: newInStock };
                            }
                            return p;
                          })
                        );
                        return;
                      }
                      setProducts((prev) =>
                        prev.map((p) => {
                          if (p.id === prod.id) {
                            const newInStock = p.inStock.map((ins, i) => {
                              if (i === whIndex) {
                                return {
                                  ...ins,
                                  exportQuantity: val,
                                  error: ""
                                };
                              }
                              return ins;
                            });
                            return { ...p, inStock: newInStock };
                          }
                          return p;
                        })
                      );
                    }}
                  />
                  {wh.error && (
                    <div className="text-red-500 text-xs mt-1">{wh.error}</div>
                  )}
                </div>
              </td>
              {isFirstRow && (
                <td rowSpan={rowSpan} className="px-3 py-2 text-center text-sm">
                  <Tooltip title="Xóa">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteRow(prod.id)}
                    >
                      <HighlightOffRounded />
                    </IconButton>
                  </Tooltip>
                </td>
              )}
            </tr>
          );
        });
      });
    }
  };

  // ------------------ Xử lý khi ấn Lưu với validate bổ sung ------------------
  const handleSave = async () => {
    try {
      if (!category) {
        alert("Vui lòng chọn phân loại xuất kho.");
        return;
      }

      if (!createdDate) {
        alert("Vui lòng chọn ngày lập phiếu.");
        return;
      }

      if ((category === "Gia công" || category === "Trả lại hàng mua") && !partnerId) {
        alert(category === "Gia công" ? "Vui lòng chọn đối tác gia công!" : "Vui lòng chọn nhà cung cấp!");
        return;
      }

      const isExportExceed = products.some((prod) => {
        const items = prod.inventory || prod.inStock;
        return items.some((item) => item.exportQuantity > item.quantity);
      });
      if (isExportExceed) {
        alert("Số lượng xuất không được vượt quá số lượng tồn kho!");
        return;
      }

      let details = [];

      if (category === "Gia công" || category === "Trả lại hàng mua") {
        details = products
          .filter((row) => row.materialId && row.inventory?.length > 0)
          .flatMap((row) =>
            row.inventory
              .filter((wh) => wh.warehouseId && wh.exportQuantity > 0)
              .map((wh) => ({
                warehouseId: wh.warehouseId,
                materialId: row.materialId,
                quantity: wh.exportQuantity,
                unitId: row.unitId || 1,
              }))
          );
      } else if (category === "Sản xuất") {
        details = products
          .filter((row) => row.itemId && row.inStock?.length > 0)
          .flatMap((row) =>
            row.inStock
              .filter((wh) => wh.warehouseId && wh.exportQuantity > 0)
              .map((wh) => ({
                warehouseId: wh.warehouseId,
                [row.itemType === 'product' ? 'productId' : 'materialId']: row.itemId,
                quantity: wh.exportQuantity,
                unitId: row.unitId || 1,
              }))
          );
      } else { // Bán hàng
        details = products
          .filter((row) => row.productId && row.inStock?.length > 0)
          .flatMap((row) =>
            row.inStock
              .filter((wh) => wh.warehouseId && wh.exportQuantity > 0)
              .map((wh) => ({
                warehouseId: wh.warehouseId,
                productId: row.productId,
                quantity: wh.exportQuantity,
                unitId: row.unitId || 1,
              }))
          );
      }

      if (details.length === 0) {
        alert("Vui lòng nhập ít nhất một dòng xuất kho với số lượng hợp lệ!");
        return;
      }

      const payload = {
        ginCode: issueNoteCode,
        category,
        partnerId,
        issueDate: `${createdDate}T00:00:00`,
        description,
        details,
        soId,
        createdBy: 1,
        receiver: category === "Sản xuất" ? contactName : null,
      };

      console.log("Sending payload:", payload);

      const result = await addIssueNote(payload);
      if (result) {
        if (files && files.length > 0) {
          try {
            const uploadResult = await uploadPaperEvidence(
              result.ginId,
              "GOOD_ISSUE_NOTE",
              files
            );
            console.log("Upload result:", uploadResult);
          } catch (uploadError) {
            console.error("Error uploading paper evidence:", uploadError);
          }
        }
        navigate("/user/issueNote", { state: { successMessage: "Tạo phiếu xuất kho thành công!" } });
      }
    } catch (error) {
      console.error("Lỗi khi thêm phiếu xuất:", error);
      alert(`Đã xảy ra lỗi khi lưu phiếu xuất kho: ${error.message}`);
    }
  };

  return (
    <div
      className="mb-8 flex flex-col gap-12"
      style={{ height: "calc(100vh - 100px)" }}
    >
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title="Phiếu xuất kho"
            showAdd={false}
            showImport={false}
            showExport={false}
          />

          <Typography
            variant="h6"
            className="flex items-center mb-4 text-black"
          >
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            Thông tin chung
          </Typography>

          <div className="grid gap-x-12 gap-y-4 mb-4 grid-cols-3">
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Phân loại xuất kho <span className="text-red-500">*</span>
              </Typography>
              <TextField
                select
                hiddenLabel
                color="success"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                fullWidth
                size="small"
              >
                <MenuItem value="Bán hàng">Bán hàng</MenuItem>
                <MenuItem value="Sản xuất">Sản xuất</MenuItem>
                <MenuItem value="Gia công">Gia công</MenuItem>
                <MenuItem value="Trả lại hàng mua">Trả lại hàng mua</MenuItem>
              </TextField>
            </div>
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Mã phiếu
              </Typography>
              <TextField
                fullWidth
                size="small"
                color="success"
                variant="outlined"
                value={issueNoteCode}
                disabled
                sx={{
                  "& .MuiInputBase-root.Mui-disabled": {
                    bgcolor: "#eeeeee",
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                  },
                }}
              />
            </div>
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Ngày lập phiếu
              </Typography>
              <style>
                {`.MuiPickersCalendarHeader-label { text-transform: capitalize; }`}
              </style>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <DatePicker
                  value={createdDate ? dayjs(createdDate) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setCreateDate(newValue.format("YYYY-MM-DD"));
                    }
                  }}
                  format="DD/MM/YYYY"
                  dayOfWeekFormatter={(weekday) => `${weekday.format("dd")}`}
                  slotProps={{
                    day: {
                      sx: () => ({
                        "&.Mui-selected": {
                          backgroundColor: "#0ab067 !important",
                          color: "white",
                        },
                        "&.Mui-selected:hover": {
                          backgroundColor: "#089456 !important",
                        },
                        "&:hover": {
                          backgroundColor: "#0894561A !important",
                        },
                      }),
                    },
                    textField: {
                      hiddenLabel: true,
                      fullWidth: true,
                      size: "small",
                      color: "success",
                    },
                  }}
                />
              </LocalizationProvider>
            </div>
          </div>

          {category === "Bán hàng" && (
            <div className="grid grid-cols-3 gap-x-12 gap-y-4 mb-4">
              <div>
                <Typography variant="medium" className="mb-1 text-black">
                  Tham chiếu chứng từ gốc
                </Typography>
                <Autocomplete
                  options={orders}
                  disableClearable
                  clearIcon={null}
                  size="small"
                  getOptionLabel={(option) =>
                    `${option.orderCode} - ${option.orderName}`
                  }
                  value={
                    orders.find((o) => o.orderCode === referenceDocument) ||
                    null
                  }
                  onChange={(event, selectedOrder) => {
                    if (selectedOrder) {
                      handleOrderSelected(selectedOrder);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      color="success"
                      hiddenLabel
                      {...params}
                      placeholder="Tham chiếu chứng từ"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <div className="flex items-center space-x-1">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenChooseOrderModal();
                              }}
                              size="small"
                            >
                              <FaSearch fontSize="small" />
                            </IconButton>
                            {partnerCode && (
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOrderSelected(null);
                                }}
                                size="small"
                              >
                                <ClearRounded fontSize="18px" />
                              </IconButton>
                            )}
                            {params.InputProps.endAdornment}
                          </div>
                        ),
                      }}
                    />
                  )}
                />
              </div>
              <div>
                <Typography variant="medium" className="mb-1 text-black">
                  Mã khách hàng
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  type="text"
                  value={partnerCode}
                  disabled
                  sx={{
                    "& .MuiInputBase-root.Mui-disabled": {
                      bgcolor: "#eeeeee",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                  }}
                />
              </div>
              <div>
                <Typography variant="medium" className="mb-1 text-black">
                  Tên khách hàng
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  type="text"
                  value={partnerName}
                  disabled
                  sx={{
                    "& .MuiInputBase-root.Mui-disabled": {
                      bgcolor: "#eeeeee",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    },
                  }}
                />
              </div>
              <div>
                <Typography variant="medium" className="mb-1 text-black">
                  Người liên hệ
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  type="text"
                  value={contactName}
                  disabled
                  sx={{
                    "& .MuiInputBase-root.Mui-disabled": {
                      bgcolor: "#eeeeee",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                  }}
                />
              </div>
              <div className="col-span-2">
                <Typography variant="medium" className="mb-1 text-black">
                  Địa chỉ
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  type="text"
                  value={address}
                  disabled
                  sx={{
                    "& .MuiInputBase-root.Mui-disabled": {
                      bgcolor: "#eeeeee",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {category === "Sản xuất" && (
            <div className="grid grid-cols-3 gap-x-12 gap-y-4 mb-4">
              <div>
                <Typography variant="medium" className="mb-1 text-black">
                  Người nhận
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </div>
            </div>
          )}

          {category === "Gia công" && (
            <div className="grid grid-cols-3 gap-x-12 gap-y-4 mb-4">
              <div>
                <Typography variant="medium" className="mb-1 text-black">
                  Mã đối tác gia công
                </Typography>
                <Autocomplete
                  options={outsources}
                  disableClearable
                  clearIcon={null}
                  size="small"
                  getOptionLabel={(option) => option.code || ""}
                  value={outsources.find((o) => o.code === partnerCode) || null}
                  onChange={(event, sel) => {
                    if (sel) {
                      setPartnerCode(sel.code);
                      setPartnerName(sel.name);
                      setAddress(sel.address);
                      setContactName(sel.contactName);
                      setPartnerId(sel.id);
                    }
                  }}
                  slotProps={{
                    paper: {
                      sx: {
                        maxHeight: 300,
                        overflowY: "auto",
                      },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      color="success"
                      hiddenLabel
                      {...params}
                      placeholder="Mã đối tác gia công"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <div className="flex items-center space-x-1">
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCreatePartnerPopup();
                              }}
                              size="small"
                            >
                              <FaPlus fontSize="small" />
                            </IconButton>
                            {partnerCode && (
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPartnerCode("");
                                  setPartnerName("");
                                  setAddress("");
                                  setContactName("");
                                  setPartnerId(null);
                                }}
                                size="small"
                              >
                                <ClearRounded fontSize="18px" />
                              </IconButton>
                            )}
                            {params.InputProps.endAdornment}
                          </div>
                        ),
                      }}
                    />
                  )}
                />
              </div>
              <div className="col-span-2">
                <Typography variant="medium" className="mb-1 text-black">
                  Tên đối tác gia công
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  value={partnerName}
                  disabled
                  sx={{
                    "& .MuiInputBase-root.Mui-disabled": {
                      bgcolor: "#eeeeee",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    },
                  }}
                />
              </div>
              <div>
                <Typography variant="medium" className="mb-1 text-black">
                  Người liên hệ
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  value={contactName}
                  disabled
                  sx={{
                    "& .MuiInputBase-root.Mui-disabled": {
                      bgcolor: "#eeeeee",
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                    },
                  }}
                />
              </div>
              <div className="col-span-2">
                <Typography variant="medium" className="mb-1 text-black">
                  Địa chỉ
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  value={address}
                  disabled
                  sx={{
                    "& .MuiInputBase-root.Mui-disabled": {
                      bgcolor: "#eeeeee",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {category === "Trả lại hàng mua" && (
            <div className="grid grid-cols-3 gap-x-12 gap-y-4 mb-4">
              <div>
                <Typography variant="medium" className="mb-1 text-black">
                  Mã nhà cung cấp
                </Typography>
                <Autocomplete
                  options={suppliers}
                  size="small"
                  getOptionLabel={(option) => option.code || ""}
                  value={suppliers.find((o) => o.code === partnerCode) || null}
                  onChange={(event, sel) => {
                    if (sel) {
                      setPartnerCode(sel.code);
                      setPartnerName(sel.name);
                      setAddress(sel.address);
                      setContactName(sel.contactName);
                      setPartnerId(sel.id);
                    }
                  }}
                  slotProps={{
                    paper: {
                      sx: {
                        maxHeight: 300,
                        overflowY: "auto",
                      },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      color="success"
                      hiddenLabel
                      {...params}
                      placeholder="Mã nhà cung cấp"
                    />
                  )}
                />
              </div>
              <div className="col-span-2">
                <Typography variant="medium" className="mb-1 text-black">
                  Tên nhà cung cấp
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  value={partnerName}
                  disabled
                  sx={{
                    "& .MuiInputBase-root.Mui-disabled": {
                      bgcolor: "#eeeeee",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    },
                  }}
                />
              </div>
              <div>
                <Typography variant="medium" className="mb-1 text-black">
                  Người liên hệ
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  value={contactName}
                  disabled
                  sx={{
                    "& .MuiInputBase-root.Mui-disabled": {
                      bgcolor: "#eeeeee",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    },
                  }}
                />
              </div>
              <div className="col-span-2">
                <Typography variant="medium" className="mb-1 text-black">
                  Địa chỉ
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  value={address}
                  disabled
                  sx={{
                    "& .MuiInputBase-root.Mui-disabled": {
                      bgcolor: "#eeeeee",
                      "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    },
                  }}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Lý do xuất
              </Typography>
              <TextField
                fullWidth
                size="small"
                hiddenLabel
                placeholder="Lý do xuất"
                multiline
                rows={4}
                color="success"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Kèm theo
              </Typography>
              <FileUploadBox files={files} setFiles={setFiles} maxFiles={3} />
            </div>
          </div>
          <div className="py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Typography variant="small" color="blue-gray" className="font-light">
                Hiển thị
              </Typography>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="border rounded px-2 py-1"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <Typography variant="small" color="blue-gray" className="font-normal">
                bản ghi mỗi trang
              </Typography>
            </div>
          </div>

          {category === "Gia công" || category === "Trả lại hàng mua" ? (
            <div className="border rounded mb-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 border-r">STT</th>
                    <th className="px-3 py-2 border-r">Mã NVL</th>
                    <th className="px-3 py-2 border-r">Tên NVL</th>
                    <th className="px-3 py-2 border-r">Đơn vị</th>
                    <th className="px-3 py-2 border-r">Kho</th>
                    <th className="px-3 py-2 border-r">Tồn kho</th>
                    <th className="px-3 py-2 border-r">SL xuất</th>
                    <th className="px-3 py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>{renderUnifiedTableBody()}</tbody>
              </table>
            </div>
          ) : category === "Sản xuất" ? (
            <div className="border rounded mb-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 border-r">STT</th>
                    <th className="px-3 py-2 border-r">Mã SP/NVL</th>
                    <th className="px-3 py-2 border-r">Tên SP/NVL</th>
                    <th className="px-3 py-2 border-r">Đơn vị</th>
                    <th className="px-3 py-2 border-r">Kho</th>
                    <th className="px-3 py-2 border-r">Tồn kho</th>
                    <th className="px-3 py-2 border-r">SL xuất</th>
                    <th className="px-3 py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>{renderUnifiedTableBody()}</tbody>
              </table>
            </div>
          ) : (
            <div className="border rounded mb-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-3 py-2 border-r">STT</th>
                    <th className="px-3 py-2 border-r">Mã hàng</th>
                    <th className="px-3 py-2 border-r">Tên hàng</th>
                    <th className="px-3 py-2 border-r">Đơn vị</th>
                    <th className="px-3 py-2 border-r">SL Đặt</th>
                    <th className="px-3 py-2 border-r">SL đã xuất</th>
                    <th className="px-3 py-2 border-r">SL còn phải xuất</th>
                    <th className="px-3 py-2 border-r">Kho</th>
                    <th className="px-3 py-2 border-r">Tồn kho</th>
                    <th className="px-3 py-2 border-r">SL xuất</th>
                    <th className="px-3 py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>{renderUnifiedTableBody()}</tbody>
              </table>
            </div>
          )}

          {category !== "Bán hàng" && (
            <div className="flex gap-2 mb-4">
              <MuiButton size="small" variant="outlined" onClick={handleAddRow}>
                <div className="flex items-center gap-2">
                  <FaPlus className="h-4 w-4" />
                  <span>Thêm dòng</span>
                </div>
              </MuiButton>
              <MuiButton
                size="small"
                variant="outlined"
                color="error"
                onClick={handleRemoveAllRows}
              >
                <div className="flex items-center gap-2">
                  <FaTrash className="h-4 w-4" />
                  <span>Xoá hết dòng</span>
                </div>
              </MuiButton>
            </div>
          )}

          {totalElements > 0 && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal"
                >
                  Trang {currentPage + 1} / {totalPages} • {totalElements} {category === "Gia công" ? "nguyên vật liệu" : "sản phẩm"}
                </Typography>
              </div>
              <ReactPaginate
                previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
                nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
                breakLabel="..."
                pageCount={totalPages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                containerClassName="flex items-center gap-1"
                pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-[#0ab067] hover:text-white"
                pageLinkClassName="flex items-center justify-center w-full h-full"
                previousClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                nextClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                breakClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700"
                activeClassName="bg-[#0ab067] text-white border-[#0ab067] hover:bg-[#0ab067]"
                forcePage={currentPage}
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
          <Divider sx={{ marginY: "16px" }} />
          <div className="mt-4 mb-2 flex justify-between">
            <MuiButton
              color="info"
              size="medium"
              variant="outlined"
              sx={{
                height: "36px",
                color: "#616161",
                borderColor: "#9e9e9e",
                "&:hover": { backgroundColor: "#f5f5f5", borderColor: "#757575" },
              }}
              onClick={() => navigate("/user/issueNote")}
              className="flex items-center gap-2"
            >
              <FaArrowLeft className="h-3 w-3" /> Quay lại
            </MuiButton>
            <div className="flex items-center justify-end gap-2">
              <MuiButton size="medium" color="error" variant="outlined">
                Hủy
              </MuiButton>
              <Button
                size="lg"
                color="white"
                variant="text"
                className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 rounded-[4px] transition-all duration-200 ease-in-out"
                ripple={true}
                onClick={handleSave}
              >
                Lưu
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {isCreatePartnerPopupOpen && (
        <ModalAddPartner
          category={category}
          onClose={handleCloseCreatePartnerPopup}
          onSuccess={() => {
            handleCloseCreatePartnerPopup();
            if (category === "Gia công") fetchOutsources();
            if (category === "Trả lại hàng mua") fetchSuppliers();
          }}
        />
      )}

      {isChooseOrderModalOpen && (
        <ModalChooseOrder
          onClose={handleCloseChooseOrderModal}
          onOrderSelected={handleOrderSelected}
        />
      )}
    </div>
  );
};

export default AddIssueNote;