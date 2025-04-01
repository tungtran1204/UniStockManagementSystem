import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Textarea,
} from "@material-tailwind/react";
import { TextField, MenuItem, Autocomplete, IconButton, Button as MuiButton, Tooltip } from '@mui/material';
import { useNavigate, useLocation } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { FaPlus, FaTrash, FaArrowLeft } from "react-icons/fa";
import { ArrowLeftIcon, ArrowRightIcon, ListBulletIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/solid";
import PageHeader from '@/components/PageHeader';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // Import Tiếng Việt
import FileUploadBox from '@/components/FileUploadBox';
import { getPartnersByType } from "@/features/user/partner/partnerService";
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table"; // hoặc './Table' nếu file cùng thư mục
import ModalAddPartner from "../issueNote/ModalAddPartner";
import { getWarehouseList } from "../warehouse/warehouseService";
import { getProducts } from "../saleorders/saleOrdersService";
import { fetchPendingOrInProgressOrders } from "../purchaseOrder/purchaseOrderService";
import { getPurchaseOrderById } from "../purchaseOrder/purchaseOrderService";

const OUTSOURCE_TYPE_ID = 3;
const SUPPLIER_TYPE_ID = 2;

const AddReceiptNoteGeneral = () => {
  const navigate = useNavigate();
  const [isCreatePartnerPopupOpen, setIsCreatePartnerPopupOpen] = useState(false);
  const [partnerCode, setPartnerCode] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partners, setPartners] = useState([]);
  const [address, setAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [createdDate, setCreateDate] = useState("");
  const [description, setDescription] = useState("");
  const [referenceDocument, setReferenceDocument] = useState("");
  const [files, setFiles] = useState([]); // Cập nhật để hỗ trợ nhiều file;
  const [category, setCategory] = useState("");
  const selectRef = useRef(null);
  const [receiptCode, setReceiptCode] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const [OutsourceError, setOutsourceError] = useState("");
  const [outsources, setOutsources] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const location = useLocation();
  const initialNextCode = location.state?.nextCode;
  const [availableOrders, setAvailableOrders] = useState([]);
  const [availableOutsourceDocs, setAvailableOutsourceDocs] = useState([]);

  //lấy danh sách cho dropdown chứng từ tham chiếu
  useEffect(() => {
    if (category === "Vật tư mua bán") {
      fetchOutsources();
      fetchPendingOrInProgressOrders().then((orders) => {
        const formatted = orders.map((o) => ({
          label: o.poCode,
          value: o.poId,
          poCode: o.poCode,
          orderDate: dayjs(o.orderDate).format("DD/MM/YYYY"),
          supplierName: o.supplierName || "Không xác định",
        }));
        setAvailableOrders(formatted);
      });
    }

    if (category === "Hàng hóa gia công") {
      fetchOutsources();
      fetchOutsourceDocuments(); // custom danh sách cho phiếu xuất gia công
    }

  }, [category]);


  //lấy danh sách phiếu xuất gia công
  const fetchOutsourceDocuments = async () => {
    try {
      const response = await fetchPendingOrInProgressOrders(); // dùng tạm API đơn mua
      const formatted = response.map((doc) => ({
        value: doc.id,
        poCode: doc.code,
        orderDate: dayjs(doc.createdDate).format("DD/MM/YYYY"),
        supplierName: doc.partnerName,
      }));
      setAvailableOutsourceDocs(formatted);
    } catch (err) {
      console.error("Không lấy được danh sách chứng từ gia công:", err);
    }
  };



  const fetchOutsources = async () => {
    try {
      const response = await getPartnersByType(OUTSOURCE_TYPE_ID);
      if (!response || !response.partners) {
        console.error("API không trả về dữ liệu hợp lệ!");
        setOutsources([]);
        return;
      }
      const mappedOutsources = response.partners
        .map((outsource) => {
          const outsourcePartnerType = outsource.partnerTypes.find(
            (pt) => pt.partnerType.typeId === OUTSOURCE_TYPE_ID
          );
          return {
            code: outsourcePartnerType?.partnerCode || "",
            label: `${outsourcePartnerType?.partnerCode || ""} - ${outsource.partnerName}`,
            name: outsource.partnerName,
            address: outsource.address,
            phone: outsource.phone,
            contactName: outsource.contactName
          };
        })
        .filter((c) => c.code !== "");
      setOutsources(mappedOutsources);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đối tác gia công:", error);
      setOutsources([]);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await getPartnersByType(SUPPLIER_TYPE_ID);
      if (!response || !response.partners) {
        console.error("API không trả về dữ liệu hợp lệ!");
        setSuppliers([]);
        return;
      }
      const mappedSuppliers = response.partners
        .map((supplier) => {
          const supplierPartnerType = supplier.partnerTypes.find(
            (pt) => pt.partnerType.typeId === SUPPLIER_TYPE_ID
          );
          return {
            code: supplierPartnerType?.partnerCode || "",
            label: `${supplierPartnerType?.partnerCode || ""} - ${supplier.partnerName}`,
            name: supplier.partnerName,
            address: supplier.address,
            phone: supplier.phone,
            contactName: supplier.contactName
          };
        })
        .filter((c) => c.code !== "");
      setSuppliers(mappedSuppliers);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đối tác gia công:", error);
      setSuppliers([]);
    }
  };

  useEffect(() => {
    if (category === "Vật tư mua bán") {
      fetchOutsources();
    }

    if (category === "Hàng hóa gia công") {
      fetchOutsources();
    }

    if (category === "Hàng hóa trả lại") {
      fetchSuppliers();
    }
  }, [category]);

  useEffect(() => {
    if (!createdDate) {
      const today = dayjs().format("YYYY-MM-DD");
      setCreateDate(today);
    }
  }, []);

  const handleOutsourceChange = (selectedOption) => {
    setPartnerCode(selectedOption.code);
    setPartnerName(selectedOption.name);
    setAddress(selectedOption.address);
    setContactName(selectedOption.contactName);
    // setPhoneNumber(selectedOption.phone);
    if (selectedOption.code) {
      setOutsourceError("");
    }
  };

  //lấy danh sách kho, sản phẩm và mã phiếu nhập
  useEffect(() => {
    const fetchInitData = async () => {
      const resWarehouses = await getWarehouseList();
      setWarehouses(resWarehouses?.data || resWarehouses || []);

      const resProducts = await getProducts();
      const options = resProducts.content.map(p => ({
        value: p.productId,
        label: `${p.productCode} - ${p.productName}`,
        unitId: p.unitId,
        unitName: p.unitName
      }));
      setProducts(options);

      if (initialNextCode) {
        setReceiptCode(initialNextCode);
      } else {
        const nextCode = await getNextCode();
        setReceiptCode(nextCode);
      }

    };

    fetchInitData();
  }, []);


  // Danh sách sản phẩm
  const [products, setProducts] = useState([
    { id: 1, code: "UNI01_27", name: "Product name", unit: "Cái", warehouse: "KTP", quantity: 4 },
    { id: 2, code: "UNI02_44", name: "Product name", unit: "Cái", warehouse: "KTP", quantity: 4 },
    { id: 3, code: "UNI01_98", name: "Product name", unit: "Cái", warehouse: "KTP", quantity: 4 },
  ]);

  // Xử lý upload file
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length + files.length > 3) {
      alert("Tải lên tối đa 3 file!");
      return;
    }

    setFiles([...files, ...selectedFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // Phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(products.length / pageSize);
  const totalElements = products.length;

  // Kiểm tra nếu currentPage > totalPages khi dữ liệu thay đổi
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages - 1 : 0);
    }
  }, [products, totalPages]);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleAddRow = () => {
    setProducts([
      ...products,
      { id: products.length + 1, code: "", name: "Product name", unit: "Cái", warehouse: "KTP", quantity: 0 },
    ]);
  };

  const handleRemoveRow = (id) => {
    const updatedProducts = products.filter((product) => product.id !== id);
    setProducts(updatedProducts);

    if (updatedProducts.length === 0) {
      setCurrentPage(0);
    }
  };

  const handleRemoveAllRows = () => {
    setProducts([]);
    setCurrentPage(0);
  };

  const handleOpenCreatePartnerPopup = () => {
    console.log("Opening modal...");
    setIsCreatePartnerPopupOpen(true);
  };

  const handleCloseCreatePartnerPopup = () => {
    console.log("Closing modal, current state:", isCreatePartnerPopupOpen);
    setIsCreatePartnerPopupOpen(false);
  };

  const columnsConfig = [
    { field: 'index', headerName: 'STT', minWidth: 60, editable: false, renderCell: (params) => params.row.index + 1 },
    { field: 'code', headerName: 'Mã hàng', minWidth: 120, editable: false },
    { field: 'name', headerName: 'Tên hàng', minWidth: 200, editable: false },
    { field: 'unit', headerName: 'Đơn vị', minWidth: 100, editable: false },
    { field: 'warehouse', headerName: 'Kho nhập', minWidth: 120, editable: false },
    { field: 'quantity', headerName: 'Số lượng', minWidth: 100, editable: false },
    // {
    //   field: 'actions',
    //   headerName: 'Hành động',
    //   minWidth: 100,
    //   editable: false,
    //   renderCell: (params) => (
    //     <Button
    //       size="small"
    //       color="error"
    //       onClick={() => handleRemoveRow(params.row.id)}
    //     >
    //       ✖
    //     </Button>
    //   )
    // },
    {
      field: 'actions',
      headerName: 'Hành động',
      flex: 0.5,
      minWidth: 100,
      editable: false,
      filterable: false,
      renderCell: (params) => (
        <div className="flex justify-center w-full">
          <Tooltip content="Xoá">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Ngăn sự kiện bubble
                handleRemoveRow(params.row.index - 1);
              }}
              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
            >
              <FaTrash className="h-3 w-3" />
            </button>
          </Tooltip>
        </div>
      )
    }
  ];

  // Lấy danh sách sản phẩm hiển thị theo trang hiện tại
  const displayedProducts = products.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const displayedProductsWithIndex = displayedProducts.map((item, idx) => ({
    ...item,
    index: currentPage * pageSize + idx,
  }));

  const currentDocuments = category === "Hàng hóa gia công"
    ? availableOutsourceDocs
    : availableOrders;


  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        {/* Header */}
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title={`Phiếu nhập kho ${receiptCode}`}
            showAdd={false}
            showImport={false}
            showExport={false}
          />

          {/* Thông tin chung */}
          <Typography variant="h6" className="flex items-center mb-4 text-gray-700">
            <InformationCircleIcon className="h-5 w-5 mr-2"></InformationCircleIcon>
            Thông tin chung
          </Typography>
          <div
            className={`grid gap-4 mb-4 ${category === "Vật tư mua bán" || category === "Hàng hóa gia công" ? "grid-cols-3" : "grid-cols-2"}`}>
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Phân loại xuất kho
                <span className="text-red-500"> *</span>
              </Typography>
              <TextField
                select
                hiddenLabel
                color="success"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                }}
                fullWidth
                size="small"
                slotProps={{
                  select: {
                    displayEmpty: true,
                    renderValue: (selected) =>
                      selected ? selected : <span style={{ color: '#9e9e9e' }}>Phân loại nhập kho</span>,
                  },
                }}
              >
                <MenuItem value="Thành phẩm sản xuất">Thành phẩm sản xuất</MenuItem>
                <MenuItem value="Vật tư mua bán">Vật tư mua bán</MenuItem>
                <MenuItem value="Hàng hóa gia công">Hàng hóa gia công</MenuItem>
                <MenuItem value="Hàng hóa trả lại">Hàng hóa trả lại</MenuItem>
                <MenuItem value="Nhập kho vật tư thừa">Nhập kho vật tư thừa</MenuItem>
                <MenuItem value="Khác">Khác</MenuItem>
              </TextField>
              {!category && (
                <Typography variant="small" className="text-red-500 mt-1">
                  Vui lòng chọn phân loại nhập kho
                </Typography>
              )}
            </div>
            {/* Check phân loại, chứng từ tham chiếu sẽ hiển thị theo phân loại*/}
            {(category === "Vật tư mua bán" || category === "Hàng hóa gia công") && (
              <div>

                <Typography className="mb-1 text-black">
                  Tham chiếu chứng từ gốc
                </Typography>

                <TextField
                  select
                  fullWidth
                  size="small"
                  color="success"
                  value={referenceDocument}
                  onChange={async (e) => {
                    const selectedId = e.target.value;
                    setReferenceDocument(selectedId);

                    try {
                      const res = await getPurchaseOrderById(selectedId);
                      console.log("Đơn hàng chi tiết:", res);
                      // Gán thông tin đối tác
                      setPartnerName(res.supplierName || "");
                      setPartnerCode(res.supplierCode || "");
                      setContactName(res.supplierContactName || "");
                      setAddress(res.supplierAddress || "");

                      // Gán danh sách chi tiết vật tư vào bảng sản phẩm
                      const newProducts = res.details.map((item, index) => ({
                        id: index + 1,
                        code: item.materialCode,
                        name: item.materialName,
                        unit: item.unit,
                        warehouse: "", // Có thể để trống, user sẽ chọn sau
                        quantity: item.remainingQuantity, // Hoặc orderedQuantity tùy logic
                      }));

                      setProducts(newProducts);
                    } catch (err) {
                      console.error("Không lấy được thông tin đơn hàng:", err);
                    }
                  }}


                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        style: {
                          maxHeight: 300, // Có scroll nếu danh sách quá dài
                        },
                      },
                    },
                    renderValue: (selected) => {
                      const selectedOrder = availableOrders.find(o => o.value === selected);
                      return selectedOrder
                        ? `${selectedOrder.poCode}`
                        : "Chọn chứng từ...";
                    },
                  }}
                >
                  {/* Header cho các cột */}
                  <MenuItem disabled>
                    <div className="flex w-full font-semibold text-gray-700 text-sm">
                      <span className="w-[120px]">Mã chứng từ</span>
                      <span className="w-[120px]">Ngày chứng từ</span>
                      <span className="flex-1">Tên đối tác</span>
                    </div>
                  </MenuItem>

                  {currentDocuments.map((order) => (
                    <MenuItem key={order.value} value={order.value}>
                      <div className="flex w-full text-sm">
                        <span className="w-[120px]">{order.poCode}</span>
                        <span className="w-[120px] text-gray-600">{order.orderDate}</span>
                        <span className="flex-1 truncate">{order.supplierName}</span>
                      </div>
                    </MenuItem>
                  ))}

                </TextField>


              </div>
            )}
            <div>
              <Typography variant="medium" className="mb-1 text-black">
                Ngày lập phiếu
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                <DatePicker
                  value={createdDate ? dayjs(createdDate) : null}
                  onChange={(newValue) => {
                    if (newValue) {
                      setOrderDate(newValue.format("YYYY-MM-DD")); // format lại để lưu về dạng chuẩn
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
          {(category === "Vật tư mua bán" || category === "Hàng hóa gia công" || category === "Hàng hóa trả lại") && (
            <div className="grid grid-cols-3 gap-4 mb-4">

              <div className="col-span-2">
                <Typography variant="medium" className="mb-1 text-black">
                  Tên đối tác
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  type="text"
                  value={partnerName}
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
                  Số điện thoại
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  color="success"
                  variant="outlined"
                  type="text"
                  value={partnerPhone}
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

          {/* Diễn giải & Kèm theo */}
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

          {/* Danh sách sản phẩm */}
          <Typography variant="h6" className="flex items-center mb-4 text-gray-700">
            <ListBulletIcon className="h-5 w-5 mr-2"></ListBulletIcon>
            Danh sách sản phẩm
          </Typography>

          {/* Items per page and search */}
          <div className="py-2 flex items-center justify-between gap-2">
            {/* Items per page */}
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

            {/* Search input */}
            <TableSearch
              // value={searchTerm}
              // onChange={setSearchTerm}
              onSearch={() => {
                // Thêm hàm xử lý tìm kiếm vào đây nếu có
                console.log("Tìm kiếm đơn hàng:", searchTerm);
              }}
              placeholder="Tìm kiếm"
            />

          </div>

          {/* Bảng sản phẩm */}
          <Table
            data={displayedProductsWithIndex}
            columnsConfig={columnsConfig}
            enableSelection={false}
          />

          {/* Phân trang */}
          {totalElements > 0 && (
            <div className="flex items-center justify-between pt-4">
              <div className="flex items-center gap-2">
                <Typography variant="small" color="blue-gray" className="font-normal">
                  Trang {currentPage + 1} / {totalPages} • {totalElements} bản ghi
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
          <div className="flex gap-2 mt-2 mb-4 h-8">
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
                <span>Xóa hết dòng</span>
              </div>
            </MuiButton>
          </div>
          <div className="mt-6 border-t pt-4 flex justify-between">
            <MuiButton
              color="info"
              size="medium"
              variant="outlined"
              sx={{
                height: '36px',
                color: '#616161',           // text color
                borderColor: '#9e9e9e',     // border
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
              // onClick={handleCancel}
              >
                Hủy
              </MuiButton>
              <Button
                size="lg"
                color="white"
                variant="text"
                className="bg-[#0ab067] hover:bg-[#089456]/90 shadow-none text-white font-medium py-2 px-4 rounded-[4px] transition-all duration-200 ease-in-out"
                ripple={true}
              // onClick={handleSaveOrder}
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
          onSuccess={(newPartner) => {
            // Đóng modal và sau đó refresh danh sách khách hàng
            handleCloseCreatePartnerPopup();
            if (category === "Gia công") fetchOutsources();
            if (category === "Trả lại hàng mua") fetchSuppliers();
          }}
        />
      )}
    </div >
  );
};

export default AddReceiptNoteGeneral;
