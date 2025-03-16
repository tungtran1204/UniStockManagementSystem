import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
  Select,
  Option,
  Textarea,
} from "@material-tailwind/react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import { getPurchaseOrderById } from "../purchaseOrder/purchaseOrderService";
import { getWarehouseList } from "../warehouse/warehouseService";
import ProductRow from "./ProductRow";


// Hàm lấy ngày hiện tại YYYY-MM-DD
const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0]; // Cắt chỉ lấy YYYY-MM-DD
};

// Hàm kiểm tra số lượng nhập hợp lệ (không được chênh lệch quá 1% so với số lượng đặt)
const isValidQuantity = (inputQty, orderedQty) => {
  if (!inputQty || isNaN(inputQty)) return false;

  const numInputQty = parseFloat(inputQty);
  const numOrderedQty = parseFloat(orderedQty);
  const minAllowed = 1;
  const maxAllowed = numOrderedQty * 1.01; // +1%

  return numInputQty >= minAllowed && numInputQty <= maxAllowed;
};

const AddReceiptNote = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [referenceDocument, setReferenceDocument] = useState("");
  const [files, setFiles] = useState([]);
  const [orderDate, setOrderDate] = useState(getTodayDate());
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [warehouses, setWarehouses] = useState([]);
  const [itemWarehouses, setItemWarehouses] = useState({}); // Lưu trữ kho cho từng sản phẩm
  const [manuallySelectedWarehouses, setManuallySelectedWarehouses] = useState({}); // NEW: Theo dõi các kho được chọn thủ công
  const [itemQuantities, setItemQuantities] = useState({}); // Lưu trữ số lượng nhập
  const [quantityErrors, setQuantityErrors] = useState({}); // Lưu trữ lỗi số lượng

  const { orderId, nextCode } = location.state || {}; // Nhận dữ liệu từ navigate()
  const [receiptCode, setReceiptCode] = useState(nextCode || "");
  const [rowsData, setRowsData] = useState({});

  console.log("Nhận orderId:", orderId);
  console.log("Nhận nextCode:", nextCode);

  // Xác định kho mặc định dựa trên loại nhập kho
  const getDefaultWarehouse = (warehouseType) => {
    const warehouseTypeMap = {
      "Thành phẩm sản xuất": "KTP", // Mã cho Kho thành phẩm
      "Vật tư mua bán": "KVT", // Mã cho Kho vật tư
      "Hàng hóa gia công": "KVT", // Cũng sử dụng Kho vật tư
      "Hàng hóa trả lại": "KPL" // Mã cho Kho phế liệu
    };

    const warehouseCode = warehouseTypeMap[warehouseType] || "";
    const defaultWarehouse = warehouses.find(w => w.warehouseCode === warehouseCode);
    return defaultWarehouse ? defaultWarehouse.warehouseCode : "";
  };

  // Xử lý thay đổi dữ liệu từ ProductRow
  const handleRowDataChange = (itemId, data) => {
    setRowsData(prev => ({
      ...prev,
      [itemId]: data
    }));
  };

  // Xử lý khi loại nhập kho thay đổi
  const handleReferenceDocumentChange = (value) => {
    setReferenceDocument(value);

    // Khi thay đổi loại nhập kho, chỉ cập nhật kho mặc định cho những sản phẩm chưa được chọn thủ công
    if (order && order.details) {
      const defaultWarehouseCode = getDefaultWarehouse(value);

      setItemWarehouses(prev => {
        const updatedWarehouses = { ...prev };

        order.details.forEach(item => {
          // Nếu sản phẩm chưa được chọn thủ công, cập nhật theo loại nhập kho mới
          if (!manuallySelectedWarehouses[item.id]) {
            updatedWarehouses[item.id] = defaultWarehouseCode;
          }
        });

        return updatedWarehouses;
      });
    }
  };

  // Xử lý thay đổi kho cho sản phẩm
  const handleWarehouseChange = (itemId, warehouseCode) => {
    setItemWarehouses(prev => ({
      ...prev,
      [itemId]: warehouseCode
    }));

    // Đánh dấu rằng kho này đã được chọn thủ công
    setManuallySelectedWarehouses(prev => ({
      ...prev,
      [itemId]: true
    }));
  };

  // Xử lý thay đổi số lượng nhập
  const handleQuantityChange = (itemId, value, orderedQuantity) => {
    // Cập nhật số lượng cho sản phẩm cụ thể
    setItemQuantities(prev => ({
      ...prev,
      [itemId]: value
    }));

    // Validate số lượng riêng cho sản phẩm này
    if (!isValidQuantity(value, orderedQuantity)) {
      setQuantityErrors(prev => ({
        ...prev,
        [itemId]: "Số lượng nhập phải hợp lệ và không lớn hơn 1% so với số lượng đặt"
      }));
    } else {
      setQuantityErrors(prev => {
        const updated = { ...prev };
        delete updated[itemId];
        return updated;
      });
    }
  };

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

  // Xử lý lưu phiếu nhập
  const handleSaveReceipt = () => {
    // Kiểm tra dữ liệu
    const itemsWithMissingData = order.details.filter(item =>
      !rowsData[item.id] || !rowsData[item.id].warehouse
    );

    if (itemsWithMissingData.length > 0) {
      alert("Vui lòng chọn kho nhập cho tất cả sản phẩm!");
      return;
    }

    // Kiểm tra lỗi số lượng
    const itemsWithErrors = order.details.filter(item =>
      rowsData[item.id] && rowsData[item.id].error
    );

    if (itemsWithErrors.length > 0) {
      alert("Vui lòng sửa các lỗi số lượng nhập trước khi lưu!");
      return;
    }

    // Kiểm tra xem tất cả các sản phẩm đã có số lượng nhập chưa
    const itemsWithoutQuantity = order.details.filter(item =>
      !rowsData[item.id] || !rowsData[item.id].quantity
    );

    if (itemsWithoutQuantity.length > 0) {
      alert("Vui lòng nhập số lượng cho tất cả sản phẩm!");
      return;
    }

    // Tạo dữ liệu phiếu nhập
    const receiptData = {
      receiptCode,
      description,
      orderDate,
      referenceDocument,
      orderId,
      items: order.details.map(item => ({
        materialId: item.id,
        quantity: parseFloat(rowsData[item.id].quantity),
        warehouseId: rowsData[item.id].warehouse
      }))
    };

    console.log("Dữ liệu phiếu nhập:", receiptData);
    // TODO: Gọi API lưu phiếu nhập

    // Sau khi lưu thành công
    alert("Lưu phiếu nhập thành công!");
    navigate("/user/receiptNote");
  };

  // Lấy danh sách kho
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await getWarehouseList();

        console.log("Danh sách kho trả về từ API:", response);
        // Đảm bảo response có dữ liệu đúng định dạng
        if (response && Array.isArray(response.data)) {
          setWarehouses(response.data);
        } else if (Array.isArray(response)) {
          setWarehouses(response);
        } else {
          console.error("Dữ liệu kho không đúng định dạng:", response);
          setWarehouses([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách kho:", error);
        setWarehouses([]);
      }
    };

    fetchWarehouses();
  }, []);

  // Khởi tạo số lượng cho các sản phẩm
  useEffect(() => {
    if (order?.details?.length > 0) {
      const initialQuantities = {};
      order.details.forEach(item => {
        initialQuantities[item.id] = item.orderedQuantity || 0;
      });
      setItemQuantities(initialQuantities);
    }
  }, [order]); // Chỉ chạy khi `order` thay đổi

  // Lấy chi tiết đơn hàng và khởi tạo các giá trị mặc định
  useEffect(() => {
    if (!orderId) {
      setError("Không tìm thấy ID đơn hàng!");
      setLoading(false);
    } else {
      const fetchOrderDetail = async () => {
        try {
          console.log("📢 Gọi API lấy đơn hàng với ID:", orderId);
          const response = await getPurchaseOrderById(orderId);
          console.log("✅ Kết quả từ API:", response);

          setOrder(response);

          const initialQuantities = {};
          const initialWarehouses = { ...itemWarehouses };

          if (response.details) {
            response.details.forEach(item => {
              initialQuantities[item.id] = parseFloat(item.orderedQuantity) || 0;

              if (!initialWarehouses[item.id] && !manuallySelectedWarehouses[item.id]) {
                initialWarehouses[item.id] = getDefaultWarehouse(referenceDocument);
              }
            });
          }

          setItemQuantities(initialQuantities);
          setItemWarehouses(initialWarehouses);
        } catch (error) {
          console.error("❌ Lỗi khi lấy chi tiết đơn hàng:", error);
          setError("Không thể tải dữ liệu đơn hàng.");
        } finally {
          setLoading(false);
        }
      };

      fetchOrderDetail();
    }
  }, [orderId, referenceDocument, warehouses, manuallySelectedWarehouses, itemWarehouses]);

  const totalPages = Math.ceil((order?.details?.length || 0) / pageSize);
  const totalElements = order?.details?.length || 0;

  // Kiểm tra nếu currentPage > totalPages khi dữ liệu thay đổi
  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages - 1 : 0);
    }
  }, [order?.details, totalPages, currentPage]);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (loading) return <Typography>Đang tải dữ liệu...</Typography>;
  if (error) return <Typography className="text-red-500">{error}</Typography>;

  const items = order?.details || [];

  // Lấy danh sách sản phẩm hiển thị theo trang hiện tại
  const displayedItems = items.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title={"Phiếu nhập kho " + receiptCode}
            showAdd={false} // Ẩn nút thêm kho
            onImport={() => {/* Xử lý import nếu có */ }}
            onExport={() => {/* Xử lý export file ở đây nếu có */ }}
            showImport={false} // Ẩn nút import nếu không dùng
            showExport={false} // Ẩn xuất file nếu không dùng        
          />
          {/* Thông tin chung */}
          <Typography variant="h6" className="mb-2 text-gray-700 text-sm font-semibold">
            Thông tin chung
          </Typography>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <Typography variant="small">Nhập kho</Typography>
              <Select
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={referenceDocument}
                onChange={(value) => handleReferenceDocumentChange(value)}>
                <Option value="Thành phẩm sản xuất">Thành phẩm sản xuất</Option>
                <Option value="Vật tư mua bán">Vật tư mua bán</Option>
                <Option value="Hàng hóa gia công">Hàng hóa gia công</Option>
                <Option value="Hàng hóa trả lại">Hàng hóa trả lại</Option>
              </Select>
            </div>
            <div>
              <Typography variant="small">Tham chiếu chứng từ gốc</Typography>
              <Select
                value={order.poCode}
                disabled={!!orderId} // Vô hiệu hóa nếu có orderId
              >
                <Option value="Chứng từ A">Chứng từ A</Option>
                <Option value="Chứng từ B">Chứng từ B</Option>
              </Select>
            </div>
            <div>
              <Typography variant="small">Ngày tạo phiếu</Typography>
              <Input
                type="date"
                value={orderDate}
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="small">Tên đối tác</Typography>
              <Input value={order.supplierName} disabled />
            </div>
            <div>
              <Typography variant="small">Địa chỉ</Typography>
              <Input value={order.supplierAddress} disabled />
            </div>
            <div>
              <Typography variant="small">Người liên hệ</Typography>
              <Input value={order.supplierContactName} disabled />
            </div>
            <div>
              <Typography variant="small">Số điện thoại</Typography>
              <Input value={order.supplierPhone} disabled />
            </div>
          </div>

          {/* Diễn giải & Kèm theo */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <Typography variant="small">Diễn giải</Typography>
              <Textarea
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Typography variant="small">Kèm theo</Typography>
              <div className="border border-dashed border-gray-400 p-4 rounded-md text-center">
                <p className="text-gray-500 text-xs">Kéo thả file vào đây</p>
                <p className="text-xs">Hoặc</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.png,.docx,.xlsx"
                  className="mt-2 text-xs"
                />
              </div>

              {/* Hiển thị danh sách file đã chọn */}
              {files.length > 0 && (
                <div className="mt-2">
                  <Typography variant="small" className="font-semibold">
                    File đã chọn ({files.length}/3):
                  </Typography>
                  <div className="grid grid-cols-3 gap-2 mt-1 text-sm text-gray-700">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border p-1 rounded-md text-xs bg-gray-100"
                      >
                        <span className="truncate max-w-[80px]">{file.name}</span>
                        <Button size="sm" color="red" variant="text" onClick={() => handleRemoveFile(index)}>
                          ✖
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Danh sách sản phẩm */}
          <Typography variant="h6" className="mb-2 text-gray-700 text-sm font-semibold">
            Danh sách sản phẩm
          </Typography>

          {/* Thanh điều khiển phân trang */}
          <div className="px-4 py-2 flex items-center gap-4 mb-4">
            <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
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
            <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
              kết quả mỗi trang
            </Typography>
          </div>

          {/* Bảng sản phẩm */}
          <div className="overflow-auto border rounded">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">STT</th>
                  <th className="p-2 border">Mã hàng</th>
                  <th className="p-2 border">Tên hàng</th>
                  <th className="p-2 border">Đơn vị</th>
                  <th className="p-2 border">Nhập kho</th>
                  <th className="p-2 border">Số lượng đặt</th>
                  <th className="p-2 border">Số lượng nhập</th>
                </tr>
              </thead>
              <tbody>
                {displayedItems.map((item, index) => (
                  <ProductRow
                    key={`item-${item.id}-${index}`}
                    item={item}
                    index={index}
                    warehouses={warehouses}
                    defaultWarehouseCode={getDefaultWarehouse(referenceDocument)}
                    currentPage={currentPage}
                    pageSize={pageSize}
                    onDataChange={handleRowDataChange}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Tổng số lượng */}
          <div className="flex justify-end mt-2 pr-4 text-gray-800 text-sm font-semibold">
            <span>TỔNG</span>
            <span className="ml-6">
              {order.details.reduce((sum, item) => {
                const rowData = rowsData[item.id];
                const numQty = rowData && rowData.quantity ? parseFloat(rowData.quantity) || 0 : 0;
                return sum + numQty;
              }, 0).toFixed(2)}
            </span>
          </div>

          {/* Phân trang */}
          {totalElements > 0 && (
            <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
              <div className="flex items-center gap-2">
                <Typography variant="small" color="blue-gray" className="font-normal">
                  Trang {currentPage + 1} / {totalPages} • {totalElements} bản ghi
                </Typography>
              </div>
              <ReactPaginate
                previousLabel={<ArrowLeftIcon className="h-4 w-4" />}
                nextLabel={<ArrowRightIcon className="h-4 w-4" />}
                pageCount={totalPages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                containerClassName="flex items-center gap-2"
                pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                activeClassName="bg-blue-500 text-white"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
          <div className="mt-6 border-t pt-4 flex justify-between">
            <Button
              size="sm"
              color="red"
              variant="text"
              onClick={() => navigate("/user/receiptNote")}
              className="mr-4"
            >
              Quay lại danh sách
            </Button>
            <Button
              size="sm"
              color="green"
              onClick={handleSaveReceipt}
            >
              Lưu
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AddReceiptNote;