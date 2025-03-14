import React, { useState, useEffect } from "react";
import usePurchaseOrder from "./usePurchaseOrder";
import { InboxArrowDownIcon } from "@heroicons/react/24/solid";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem
} from "@material-tailwind/react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Input,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { ArrowLeftIcon, ArrowRightIcon, EyeIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';

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
            {/* <TableSearch
              value={searchKeyword}
              onChange={setSearchKeyword}
              onSearch={() => {
                console.log("Tìm kiếm đơn mua:", searchKeyword);
                // Could call an API search here if server-side search is preferred
              }}
              placeholder="Tìm kiếm đơn"
            /> */}
          </div>

          {/* Data table */}
          <div className="overflow-auto border rounded">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOrders(purchaseOrders.map(order => order.poId));
                        } else {
                          setSelectedOrders([]);
                        }
                      }}
                      checked={selectedOrders.length === purchaseOrders.length && purchaseOrders.length > 0}
                    />
                  </th>
                  <th className="p-2 border">Mã đơn
                    <button onClick={() => handleSort("poCode")} className="ml-1 inline-block">
                      {sortColumn === "poCode" ? (
                        sortDirection === "asc" ? <ChevronUpIcon className="h-4 w-4 text-black" /> : <ChevronDownIcon className="h-4 w-4 text-black" />
                      ) : <ChevronUpIcon className="h-4 w-4 text-gray-400" />}
                    </button>
                  </th>
                  <th className="p-2 border">Tên NCC</th>
                  <th className="p-2 border">Người liên hệ</th>
                  <th className="p-2 border">Số điện thoại</th>
                  <th className="p-2 border">Ngày tạo đơn
                    <button onClick={() => handleSort("orderDate")} className="ml-1 inline-block">
                      {sortColumn === "orderDate" ? (
                        sortDirection === "asc" ? <ChevronUpIcon className="h-4 w-4 text-black" /> : <ChevronDownIcon className="h-4 w-4 text-black" />
                      ) : <ChevronUpIcon className="h-4 w-4 text-gray-400" />}
                    </button>
                  </th>

                  <th className="p-2 border">
                    <div className="flex items-center justify-between">
                      Trạng thái
                      <Menu>
                        <MenuHandler>
                          <button className="ml-2">
                            <ChevronDownIcon className="h-4 w-4 text-blue-500" />
                          </button>
                        </MenuHandler>
                        <MenuList>
                          <MenuItem onClick={() => setSelectedStatus("")}>Tất cả</MenuItem>
                          {statuses.map((status) => (
                            <MenuItem key={status} onClick={() => setSelectedStatus(status)}>
                              {status}
                            </MenuItem>
                          ))}
                        </MenuList>
                      </Menu>
                    </div>
                  </th>

                  <th className="p-2 border">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {!loading && filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan="8" className="p-4 text-center">Không có dữ liệu</td>
                  </tr>
                )}
                {filteredOrders.map((order) => (
                  <tr key={order.poId} className="text-center">
                    <td className="p-2 border">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.poId)}
                        onChange={() => toggleSelectOrder(order.poId)}
                      />
                    </td>
                    <td className="p-2 border">{order.poCode}</td>
                    <td className="p-2 border">{order.supplierName || "không có thông tin"}</td>
                    <td className="p-2 border">{order.supplierContactName || "không có thông tin"}</td>
                    <td className="p-2 border">{order.supplierPhone || "không có thông tin"}</td>
                    <td className="p-2 border">
                      {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-2 border font-semibold text-sm">{order.status.label || 'Chờ nhận'}</td>
                    <td className="p-2 border">
                    <div className="flex justify-center items-center space-x-4 w-full">
                      <EyeIcon
                        className="h-5 w-5 text-blue-500 cursor-pointer"
                        title="Xem chi tiết"
                        onClick={() => viewOrderDetail(order.poId)}
                      />
                      <InboxArrowDownIcon
                        className="h-5 w-5 text-green-500 cursor-pointer ml-2"
                        title="Nhập kho"
                        onClick={() => navigate(`/user/receiptNote/add`, { state: { order } })}
                      />
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
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
              activeClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
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