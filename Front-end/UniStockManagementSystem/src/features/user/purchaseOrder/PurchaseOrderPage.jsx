import React, { useState, useEffect } from "react";
import usePurchaseOrder from "./usePurchaseOrder";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tooltip,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { ArrowLeftIcon, ArrowRightIcon, EyeIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";

const PurchaseOrderPage = () => {
  const navigate = useNavigate();

  // Use the hook to get data and methods, similar to WarehousePage
  const {
    purchaseOrders,
    fetchPaginatedOrders,
    totalPages,
    totalElements,
    loading,
    error
  } = usePurchaseOrder();

  const statuses = ["Chờ nhận", "Đang giao", "Hoàn thành", "Hủy"];

  // State for search, filtering and sorting
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [selectedOrders, setSelectedOrders] = useState([]);

  // Fetch orders when component mounts or pagination changes
  useEffect(() => {
    fetchPaginatedOrders(currentPage, pageSize, searchKeyword, selectedStatus);
  }, [currentPage, pageSize, searchKeyword, selectedStatus]);

  // Sorting handler
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter orders client-side
  const filteredOrders = purchaseOrders
    .filter((order) =>
      Object.values(order).some((value) =>
        value && value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
      ) && (selectedStatus ? order.status === selectedStatus : true)
    )
    .sort((a, b) => {
      if (!sortColumn) return 0;
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];

      if (sortColumn === "orderDate") {
        valueA = new Date(a.orderDate);
        valueB = new Date(b.orderDate);
      }

      if (valueA === undefined || valueB === undefined) return 0;

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  const toggleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id]
    );
  };

  const printOrders = () => {
    alert(`In các đơn hàng: ${selectedOrders.join(", ")}`);
  };

  // View order details
  const viewOrderDetail = (orderId) => {
    if (!orderId) {
      console.error("Lỗi: orderId không hợp lệ!");
      return;
    }
    console.log(`🔍 Điều hướng đến chi tiết đơn hàng: /user/purchaseOrder/${orderId}`);
    navigate(`/user/purchaseOrder/${orderId}`);
  };

  const columnsConfig = [
    { field: 'poCode', headerName: 'Mã đơn', flex: 1.5, minWidth: 150, editable: false },
    { field: 'supplierName', headerName: 'Nhà cung cấp', flex: 2, minWidth: 200, editable: false },
    { field: 'supplierContactName', headerName: 'Người liên hệ', flex: 1.5, minWidth: 150, editable: false },
    { field: 'supplierPhone', headerName: 'Số điện thoại', flex: 1.5, minWidth: 150, editable: false },
    {
      field: 'orderDate',
      headerName: 'Ngày tạo đơn',
      flex: 1.5,
      minWidth: 150,
      editable: false,
      renderCell: (params) => new Date(params.value).toLocaleDateString("vi-VN"),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      flex: 1.5,
      minWidth: 150,
      renderCell: (params) => (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${params.value === "Hoàn thành"
            ? "bg-green-100 text-green-800"
            : params.value === "Đang giao"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`
        }>
          {params.value}
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'Hành động',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <Tooltip content="Xem chi tiết">
          <button className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            onClick={() => viewOrderDetail(params.row.id)}
          >
            <EyeIcon className="h-5 w-5" />
          </button>
        </Tooltip>
      ),
    },
  ];

  const data = purchaseOrders.map((order) => ({
    id: order.poId,
    poCode: order.poCode,
    supplierName: order.supplierName || "N/A",
    supplierContactName: order.supplierContactName || "N/A",
    supplierPhone: order.supplierPhone || "N/A",
    orderDate: order.orderDate,
    status: order.status.label || "Chờ nhận",
  }));

  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title="Danh sách đơn mua hàng"
            onExport={printOrders}
            showAdd={false}
            showImport={false}
          />
          {error && <Typography className="text-center text-red-500 py-4">{error}</Typography>}

          {/* Pagination controls */}
          <div className="py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
                Hiển thị
              </Typography>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border rounded px-2 py-1"
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
                bản ghi mỗi trang
              </Typography>
            </div>

            {/* Search bar */}
            <TableSearch
              value={searchKeyword}
              onChange={setSearchKeyword}
              onSearch={() => {
                console.log("Tìm kiếm đơn mua:", searchKeyword);
                // Could call an API search here if server-side search is preferred
              }}
              placeholder="Tìm kiếm đơn mua"
            />
          </div>

          {/* Data table */}
          <Table
            data={data}
            columnsConfig={columnsConfig}
            enableSelection={false}
          />

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

export default PurchaseOrderPage;