import React, { useState, useEffect, useRef } from "react";
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
  Tooltip
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ListBulletIcon
} from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

import PageHeader from '@/components/PageHeader';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // Import Tiếng Việt

import FileUploadBox from '@/components/FileUploadBox';
import ModalAddPartner from "./ModalAddPartner";
import ModalChooseOrder from "./ModalChooseOrder";
import TableSearch from '@/components/TableSearch';

import { getPartnersByType /* ... */ } from "@/features/user/partner/partnerService";
import { getSaleOrders } from "./issueNoteService";
import { getTotalQuantityOfProduct } from "../saleorders/saleOrdersService";

// Import useIssueNote có chứa addIssueNote
import useIssueNote from "./useIssueNote";

const OUTSOURCE_TYPE_ID = 3;
const SUPPLIER_TYPE_ID = 2;

const AddIssueNote = () => {
  const navigate = useNavigate();
  const { fetchNextCode, addIssueNote } = useIssueNote();

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
  // Thêm state soId để lưu orderId khi chọn đơn hàng
  const [soId, setSoId] = useState(null);

  // ------------------ STATE: Modal Đơn hàng ------------------
  const [orders, setOrders] = useState([]);
  const [isChooseOrderModalOpen, setIsChooseOrderModalOpen] = useState(false);

  // ------------------ STATE: Đối tác (gia công, NCC) ------------------
  const [outsources, setOutsources] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isCreatePartnerPopupOpen, setIsCreatePartnerPopupOpen] = useState(false);

  // ------------------ STATE: Danh sách sản phẩm + inStock ------------------
  const [products, setProducts] = useState([]);

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
        const mapped = response.content.map((order) => ({
          id: order.orderId,
          orderCode: order.orderCode,
          orderName: order.note || "Không có ghi chú",
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
            code: t?.partnerCode || "",
            label: `${t?.partnerCode || ""} - ${o.partnerName}`,
            name: o.partnerName,
            address: o.address,
            phone: o.phone,
            contactName: o.contactName,
          };
        })
        .filter((c) => c.code !== "");
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
  }, [category]);

  // ------------------ Handle chọn đơn hàng ------------------
  const handleOpenChooseOrderModal = () => setIsChooseOrderModalOpen(true);
  const handleCloseChooseOrderModal = () => setIsChooseOrderModalOpen(false);

  const handleOrderSelected = async (selectedOrder) => {
    setReferenceDocument(selectedOrder.orderCode);
    setSoId(selectedOrder.id); // Lưu orderId vào state soId
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

    // Tạo mảng products[] = 1 item/sp, inStock[] = ds kho
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

      // Nếu rỗng => 1 row default (warehouseId=null => dễ gây lỗi 500)
      if (!inStockArr || inStockArr.length === 0) {
        inStockArr = [
          {
            warehouseId: null,
            warehouseName: "",
            quantity: 0,
            exportQuantity: 0,
          },
        ];
      }

      newProducts.push({
        id: `p-${detail.productId}-${Math.random()}`,
        productId: detail.productId,
        productCode: detail.productCode || "",
        productName: detail.productName || "",
        unitName: detail.unitName || "",
        orderQuantity: detail.quantity || 0,
        inStock: inStockArr.map((wh) => ({
          warehouseId: wh.warehouseId,
          warehouseName: wh.warehouseName || "",
          quantity: wh.quantity || 0,
          exportQuantity: 0,
        })),
      });
    }
    setProducts(newProducts);
    handleCloseChooseOrderModal();
  };

  // ------------------ Mở popup thêm đối tác ------------------
  const handleOpenCreatePartnerPopup = () => setIsCreatePartnerPopupOpen(true);
  const handleCloseCreatePartnerPopup = () => setIsCreatePartnerPopupOpen(false);

  // ------------------ Thêm/Xoá dòng sản phẩm ------------------
  const handleAddRow = () => {
    setProducts((prev) => [
      ...prev,
      {
        id: `new-${prev.length + 1}`,
        productId: null,
        productCode: "",
        productName: "",
        unitName: "",
        orderQuantity: 1,
        inStock: [
          {
            warehouseId: null,
            warehouseName: "",
            quantity: 0,
            exportQuantity: 0,
          },
        ],
      },
    ]);
  };

  const handleRemoveAllRows = () => setProducts([]);
  const handleDeleteRow = (rowId) => {
    setProducts((prev) => prev.filter((p) => p.id !== rowId));
  };

  // ------------------ Pagination cho products ------------------
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

  const displayedProducts = products.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  // ------------------ Render bảng sản phẩm ------------------
  const renderTableBody = () => {
    if (displayedProducts.length === 0) {
      return (
        <tr>
          <td colSpan={9} className="text-center py-3 text-gray-500">
            Chưa có sản phẩm nào
          </td>
        </tr>
      );
    }

    return displayedProducts.flatMap((prod, prodIndex) => {
      return prod.inStock.map((wh, whIndex) => {
        const isFirstRow = whIndex === 0;
        const rowSpan = prod.inStock.length;

        return (
          <tr key={`${prod.id}-wh-${whIndex}`} className="border-b hover:bg-gray-50">
            {isFirstRow && (
              <td
                rowSpan={rowSpan}
                className="px-3 py-2 border-r text-center text-sm"
              >
                {currentPage * pageSize + (prodIndex + 1)}
              </td>
            )}
            {isFirstRow && (
              <td
                rowSpan={rowSpan}
                className="px-3 py-2 border-r text-sm"
              >
                {prod.productCode}
              </td>
            )}
            {isFirstRow && (
              <td
                rowSpan={rowSpan}
                className="px-3 py-2 border-r text-sm"
              >
                {prod.productName}
              </td>
            )}
            {isFirstRow && (
              <td
                rowSpan={rowSpan}
                className="px-3 py-2 border-r text-sm"
              >
                {prod.unitName}
              </td>
            )}
            {isFirstRow && (
              <td
                rowSpan={rowSpan}
                className="px-3 py-2 border-r text-sm text-center"
              >
                {prod.orderQuantity}
              </td>
            )}

            <td className="px-3 py-2 border-r text-sm">
              {wh.warehouseName || "(Chưa có kho)"}
            </td>
            <td className="px-3 py-2 border-r text-sm text-right">
              {wh.quantity}
            </td>
            <td className="px-3 py-2 border-r text-sm w-24">
              <input
                type="number"
                className="border p-1 text-right w-[60px]"
                value={wh.exportQuantity || 0}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setProducts((prev) =>
                    prev.map((p) => {
                      if (p.id === prod.id) {
                        const newInStock = [...p.inStock];
                        newInStock[whIndex] = {
                          ...newInStock[whIndex],
                          exportQuantity: val
                        };
                        return { ...p, inStock: newInStock };
                      }
                      return p;
                    })
                  );
                }}
              />
            </td>

            {isFirstRow && (
              <td
                rowSpan={rowSpan}
                className="px-3 py-2 text-center text-sm"
              >
                <Tooltip title="Xóa sản phẩm">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteRow(prod.id)}
                  >
                    <FaTrash />
                  </IconButton>
                </Tooltip>
              </td>
            )}
          </tr>
        );
      });
    });
  };

  // ------------------ Xử lý khi ấn Lưu ------------------
  const handleSave = async () => {
    try {
      // Validate required fields
      if (!category) {
        alert("Vui lòng chọn phân loại xuất kho.");
        return;
      }

      if (!createdDate) {
        alert("Vui lòng chọn ngày lập phiếu.");
        return;
      }

      // Prepare details with proper validation
      const details = products.flatMap(prod => 
        prod.inStock
          .filter(wh => wh.warehouseId && wh.exportQuantity > 0)
          .map(wh => ({
            warehouseId: wh.warehouseId,
            productId: prod.productId,
            quantity: wh.exportQuantity,
            unitId: 1 // Assuming default unit, should be dynamic in real app
          }))
      );

      if (details.length === 0) {
        alert("Vui lòng nhập ít nhất một dòng sản phẩm với số lượng xuất hợp lệ!");
        return;
      }

      // Thay vì lấy soId từ referenceDocument, ta sử dụng soId lưu ở state
      console.log("Reference Document:", referenceDocument);
      console.log("soId state:", soId);

      // Prepare payload with proper date format
      const payload = {
        ginCode: issueNoteCode,
        category,
        issueDate: `${createdDate}T00:00:00`, // Full ISO format
        description,
        details,
        soId: soId, // Sử dụng soId từ state đã được lưu khi chọn đơn hàng
        createdBy: 1 // Should be dynamic in real app
      };

      console.log("Sending payload:", payload); // Debug log

      const result = await addIssueNote(payload);
      if (result) {
        alert("Tạo phiếu xuất kho thành công!");
        navigate("/user/issueNote");
      }
    } catch (error) {
      console.error("Lỗi khi thêm phiếu xuất:", error);
      alert(`Đã xảy ra lỗi khi lưu phiếu xuất kho: ${error.message}`);
    }
  };

  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh - 100px)' }}>
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
            className="flex items-center mb-4 text-gray-700"
          >
            <InformationCircleIcon className="h-5 w-5 mr-2" />
            Thông tin chung
          </Typography>

          <div
            className={`grid gap-x-12 gap-y-4 mb-4 ${
              category === "Bán hàng" || category === "Trả lại hàng mua"
                ? "grid-cols-3"
                : "grid-cols-2"
            }`}
          >
            {/* Phân loại */}
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
              {!category && (
                <Typography variant="small" className="text-red-500 mt-1">
                  Vui lòng chọn phân loại xuất kho
                </Typography>
              )}
            </div>
            {/* Mã phiếu */}
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
                InputProps={{
                  style: { backgroundColor: '#eeeeee' }
                }}
              />
            </div>
            {/* Ngày lập phiếu */}
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Ngày lập phiếu
              </Typography>
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

          {/* Form tuỳ category */}
          {category === "Bán hàng" && (
            <div className="grid grid-cols-3 gap-x-12 gap-y-4 mb-4">
              <div>
                <Typography variant="medium" className="mb-1 text-black">
                  Tham chiếu chứng từ gốc
                </Typography>
                <TextField
                  select
                  hiddenLabel
                  color="success"
                  value={referenceDocument}
                  onChange={(e) => {
                    const sel = orders.find(o => o.orderCode === e.target.value);
                    if (sel) handleOrderSelected(sel);
                  }}
                  fullWidth
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChooseOrderModal();
                        }}
                        size="small"
                      >
                        <FaPlus fontSize="small" />
                      </IconButton>
                    ),
                  }}
                >
                  {orders.map((o) => (
                    <MenuItem key={o.id} value={o.orderCode}>
                      {o.orderCode} - {o.orderName}
                    </MenuItem>
                  ))}
                </TextField>
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
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
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
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
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
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
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
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
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
              <div className="col-span-2">
                <Typography variant="medium" className="mb-1 text-black">
                  Bộ phận
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  type="text"
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
                  size="small"
                  disableClearable
                  getOptionLabel={(option) => `${option.code} - ${option.name}`}
                  value={outsources.find(o => o.code === partnerCode) || null}
                  onChange={(event, sel) => {
                    if (sel) {
                      setPartnerCode(sel.code);
                      setPartnerName(sel.name);
                      setAddress(sel.address);
                      setContactName(sel.contactName);
                    }
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
                          <>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCreatePartnerPopup();
                              }}
                              size="small"
                            >
                              <FaPlus fontSize="small" />
                            </IconButton>
                            {params.InputProps.endAdornment}
                          </>
                        )
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
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
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
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
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
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
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
                  disableClearable
                  getOptionLabel={(option) => option.code || ""}
                  value={suppliers.find(o => o.code === partnerCode) || null}
                  onChange={(event, sel) => {
                    if (sel) {
                      setPartnerCode(sel.code);
                      setPartnerName(sel.name);
                      setAddress(sel.address);
                      setContactName(sel.contactName);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      color="success"
                      hiddenLabel
                      {...params}
                      placeholder="Mã nhà cung cấp"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            <IconButton
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCreatePartnerPopup();
                              }}
                              size="small"
                            >
                              <FaPlus fontSize="small" />
                            </IconButton>
                            {params.InputProps.endAdornment}
                          </>
                        )
                      }}
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
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
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
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
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
                    '& .MuiInputBase-root.Mui-disabled': {
                      bgcolor: '#eeeeee',
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {/* Lý do xuất + File đính kèm */}
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
                rows={3}
                color="success"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Kèm theo
              </Typography>
              <FileUploadBox
                files={files}
                setFiles={setFiles}
                maxFiles={3}
              />
            </div>
          </div>

          <Typography
            variant="h6"
            className="flex items-center mb-4 text-gray-700"
          >
            <ListBulletIcon className="h-5 w-5 mr-2" />
            Danh sách sản phẩm
          </Typography>

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
                className="border text-sm rounded px-2 py-1"
              >
                {[5, 10, 20, 50].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <Typography variant="small" color="blue-gray" className="font-normal">
                bản ghi mỗi trang
              </Typography>
            </div>
            <TableSearch
              onSearch={() => {
                // Tìm kiếm (nếu cần)
              }}
              placeholder="Tìm kiếm"
            />
          </div>

          <div className="border rounded mb-4 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-3 py-2 border-r">STT</th>
                  <th className="px-3 py-2 border-r">Mã hàng</th>
                  <th className="px-3 py-2 border-r">Tên hàng</th>
                  <th className="px-3 py-2 border-r">Đơn vị</th>
                  <th className="px-3 py-2 border-r">SL Đặt</th>
                  <th className="px-3 py-2 border-r">Kho</th>
                  <th className="px-3 py-2 border-r">Tồn kho</th>
                  <th className="px-3 py-2 border-r">SL xuất</th>
                  <th className="px-3 py-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>{renderTableBody()}</tbody>
            </table>
          </div>

          <div className="flex gap-2 mb-4">
            <MuiButton
              size="small"
              variant="outlined"
              onClick={handleAddRow}
            >
              <div className='flex items-center gap-2'>
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
              <div className='flex items-center gap-2'>
                <FaTrash className="h-4 w-4" />
                <span>Xoá hết dòng</span>
              </div>
            </MuiButton>
          </div>

          {totalElements > 0 && (
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Typography variant="small" color="blue-gray" className="font-normal">
                  Trang {currentPage + 1} / {totalPages} • {totalElements} sản phẩm
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
                pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
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

          <div className="mt-6 border-t pt-4 flex justify-between">
            <MuiButton
              color="info"
              size="medium"
              variant="outlined"
              sx={{
                height: '36px',
                color: '#616161',
                borderColor: '#9e9e9e',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#757575',
                },
              }}
              onClick={() => navigate("/user/issueNote")}
              className="flex items-center gap-2"
            >
              <FaArrowLeft className="h-3 w-3" /> Quay lại
            </MuiButton>
            <div className="flex items-center justify-end gap-2 pb-2">
              <MuiButton
                size="medium"
                color="error"
                variant="outlined"
              >
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
