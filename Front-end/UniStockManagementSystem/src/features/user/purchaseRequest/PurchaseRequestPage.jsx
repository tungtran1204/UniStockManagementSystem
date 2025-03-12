import React, { useState } from "react";
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
import ReactPaginate from "react-paginate";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import usePurchaseRequest from "./usePurchaseRequest";
import { useNavigate } from "react-router-dom";

const PurchaseRequestPage = () => {
  const {
    purchaseRequests,
    totalPages,
    totalElements,
    fetchPurchaseRequests,
    getNextCode,  // Add this line
  } = usePurchaseRequest();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  const handleAddRequest = async () => {
    try {
      const code = await getNextCode();
      navigate("/user/purchase-request/add", { state: { nextCode: code } });
    } catch (error) {
      console.error("Lỗi khi lấy mã tiếp theo:", error);
      alert("Có lỗi xảy ra khi tạo mã yêu cầu mới");
    }
  };

  return (
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader
          variant="gradient"
          color="gray"
          className="mb-8 p-6 flex justify-between items-center"
        >
          <Typography variant="h6" color="white">
            Danh sách yêu cầu mua vật tư
          </Typography>
          <Button
            size="sm"
            color="white"
            variant="text"
            className="flex items-center gap-2"
            onClick={handleAddRequest}
          >
            <FaPlus className="h-4 w-4" /> Thêm yêu cầu
          </Button>
        </CardHeader>

        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          <div className="px-4 py-2 flex items-center gap-4">
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
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
              yêu cầu mỗi trang
            </Typography>

            <Input
              label="Tìm kiếm yêu cầu"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64"
              containerProps={{ className: "w-64" }}
            />
          </div>

          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {["STT", "Mã yêu cầu", "Mã đơn hàng", "Nhà cung cấp", "Ngày tạo yêu cầu", "Trạng thái", "Hành động"].map(
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
              {purchaseRequests.map((request, index) => {
                const className = `py-3 px-5 ${
                  index === purchaseRequests.length - 1 ? "" : "border-b border-blue-gray-50"
                }`;
                const actualIndex = currentPage * pageSize + index + 1;

                return (
                  <tr key={request.id}>
                    <td className={className}>
                      <Typography variant="small" color="blue-gray" className="font-semibold">
                        {actualIndex}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {request.purchaseRequestCode}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {request.purchaseOrderCode || "Chưa có"}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-semibold text-blue-gray-600">
                        {request.partnerName}
                      </Typography>
                    </td>
                    <td className={className}>
                      <Typography className="text-xs font-normal text-blue-gray-600">
                        {dayjs(request.createdDate).format("DD/MM/YYYY")} {/* Changed from createDate to createdDate */}
                      </Typography>
                    </td>
                    <td className={className}>
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          request.status === 'Đã duyệt' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`
                      }>
                        {request.status}
                      </div>
                    </td>
                    <td className={className}>
                      <div className="flex items-center gap-2">
                        <Tooltip content="Chỉnh sửa">
                          <button
                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <FaEdit className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {purchaseRequests.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              Không có dữ liệu
            </div>
          )}
        </CardBody>

        <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <Typography variant="small" color="blue-gray" className="font-normal">
            Trang {currentPage + 1} / {totalPages} • {totalElements} yêu cầu
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
      </Card>
    </div>
  );
};

export default PurchaseRequestPage;
