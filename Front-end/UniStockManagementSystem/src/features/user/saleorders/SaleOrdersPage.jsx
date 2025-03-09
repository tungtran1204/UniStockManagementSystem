import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Tooltip,
  Input,
} from "@material-tailwind/react";
import { FaPlus, FaEdit } from "react-icons/fa";
import useSaleOrder from "./useSaleOrder";
import ReactPaginate from "react-paginate";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
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
    // setNextOrderCode(code);
    navigate("/user/sale-orders/add", { state: { nextCode: code } });
  };

  const handleEditOrder = async (order) => {
    navigate(`/user/sale-orders/${order.orderId}`, { state: { order } });
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

  return (
    <div className="mb-8 flex flex-col gap-12">
      <Card className="bg-gray-100 p-7">
        <PageHeader
          title="Danh sách đơn hàng"
          addButtonLabel="Thêm đơn hàng"
          onAdd={() => handleAddOrder(true)}
          onImport={() => {/* Xử lý import nếu có */ }}
          onExport={() => {/* Xử lý export file ở đây nếu có */ }}
          showImport={false} // Ẩn nút import nếu không dùng
          showExport={false} // Ẩn xuất file nếu không dùng
        />

        <CardBody className="pb-2 bg-white rounded-xl">
          {/* Items per page and search */}
          <div className="px-4 py-2 flex items-center justify-between gap-2">
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
                console.log("Tìm kiếm kho:", searchTerm);
              }}
              placeholder="Tìm kiếm kho"
            />

          </div>

          {/* Bảng đơn hàng */}
          <table className="w-full min-w-[640px] table-auto border border-gray-200">
            <thead>
              <tr>
                {["STT", "Mã đơn hàng", "Khách hàng", "Trạng thái", "Ngày đặt hàng", "Hành động"].map(
                  (el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                      <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                        {el}
                      </Typography>
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order, index) => {
                  const className = `py-3 px-5 ${index === filteredOrders.length - 1 ? "" : "border-b border-blue-gray-50"
                    }`;
                  const actualIndex = currentPage * pageSize + index + 1;

                  return (
                    <tr key={order.orderId}>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {actualIndex}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {order.orderCode || "N/A"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {order.partnerName || "N/A"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {order.status || "N/A"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {order.orderDate ? dayjs(order.orderDate).format("DD/MM/YYYY") : "N/A"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Chỉnh sửa">
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="border-b border-gray-200 px-3 py-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Phân trang */}
          <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Trang {currentPage + 1} / {totalPages} • {totalElements} đơn hàng
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

export default SaleOrdersPage;
