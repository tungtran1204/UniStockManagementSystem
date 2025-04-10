import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Typography,
  Tooltip,
} from "@material-tailwind/react";
import {
  IconButton,
} from '@mui/material';
import {
  VisibilityOutlined
} from '@mui/icons-material';
import useSaleOrder from "./useSaleOrder";
import ReactPaginate from "react-paginate";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";
// Nếu cần edit:
// import ModalEditSaleOrder from "./ModalEditSaleOrder";

const SaleOrdersPage = () => {
  const {
    saleOrders,
    fetchPaginatedSaleOrders,
    totalPages,
    totalElements,
    getNextCode,
  } = useSaleOrder();

  // State quản lý tìm kiếm, phân trang
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);


  useEffect(() => {
    // Gọi API lấy danh sách khi thay đổi trang/pageSize
    fetchPaginatedSaleOrders(currentPage, pageSize);
  }, [currentPage, pageSize]);

  const navigate = useNavigate(); // ✅ Định nghĩa useNavigate


  const handleAddOrder = async () => {
    const code = await getNextCode();
    navigate("/user/sale-orders/add", { state: { nextCode: code } });
  };

  const handleEditOrder = async (order) => {
    navigate(`/user/sale-orders/${order.id}`, { state: { order } });
  };

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  // Lọc danh sách
  const filteredOrders = saleOrders.filter(
    (order) =>
      (order.orderCode &&
        order.orderCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.partnerName &&
        order.partnerName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusLabel = (status) => {
    switch (status) {
      case "PROCESSING": return "Đang xử lý";
      case "PREPARING_MATERIAL": return "Đang chuẩn bị vật tư";
      case "CANCELLED": return "Đã huỷ";
      default: return status;
    }
  };

  const columnsConfig = [
    { field: 'index', headerName: 'STT', flex: 0.5, minWidth: 50, editable: false },
    { field: 'orderCode', headerName: 'Mã đơn hàng', flex: 1.5, minWidth: 150, editable: false },
    { field: 'partnerName', headerName: 'Khách hàng', flex: 2, minWidth: 200, editable: false },
    { field: 'status', headerName: 'Trạng thái', flex: 1.5, minWidth: 150, editable: false },
    {
      field: 'orderDate',
      headerName: 'Ngày đặt hàng',
      flex: 1.5,
      minWidth: 150,
      editable: false,
      renderCell: (params) => params.value ? dayjs(params.value).format("DD/MM/YYYY") : "N/A",
    },
    {
      field: 'actions',
      headerName: 'Hành động',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Tooltip content="Xem chi tiết">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEditOrder(params.row)}
            >
              <VisibilityOutlined />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  const data = filteredOrders.map((order, index) => ({
    id: order.orderId,
    index: currentPage * pageSize + index + 1,
    orderCode: order.orderCode || "N/A",
    partnerName: order.partnerName || "N/A",
    status: order.statusLabel || getStatusLabel(order.status),
    orderDate: order.orderDate,
  }));



  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title="Danh sách đơn đặt hàng bán"
            addButtonLabel="Thêm đơn hàng"
            onAdd={() => handleAddOrder(true)}
            onImport={() => {/* Xử lý import nếu có */ }}
            onExport={() => {/* Xử lý export file ở đây nếu có */ }}
            showImport={false} // Ẩn nút import nếu không dùng
            showExport={false} // Ẩn xuất file nếu không dùng
          />
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
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={() => {
                // Thêm hàm xử lý tìm kiếm vào đây nếu có
                console.log("Tìm kiếm đơn hàng:", searchTerm);
              }}
              placeholder="Tìm kiếm đơn hàng"
            />

          </div>

          {/* Bảng đơn hàng */}
          <Table
            data={data}
            columnsConfig={columnsConfig}
            enableSelection={false}
          />

          {/* Phân trang */}
          <div className="flex items-center justify-between border-t border-blue-gray-50 py-4">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Trang {currentPage + 1} / {totalPages} • {totalElements} bản ghi
            </Typography>
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
        </CardBody>
      </Card>
    </div>
  );
};

export default SaleOrdersPage;
