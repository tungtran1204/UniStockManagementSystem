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
import { BiSolidEdit } from "react-icons/bi";
import ReactPaginate from "react-paginate";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import dayjs from "dayjs";
import usePurchaseRequest from "./usePurchaseRequest";
import { useNavigate } from "react-router-dom";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";

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

  const columnsConfig = [
    { field: 'index', headerName: 'STT', flex: 0.5, minWidth: 50, editable: false },
    { field: 'purchaseRequestCode', headerName: 'Mã yêu cầu', flex: 1.5, minWidth: 150, editable: false },
    { field: 'purchaseOrderCode', headerName: 'Mã đơn hàng', flex: 1.5, minWidth: 150, editable: false, renderCell: (params) => params.value || "Chưa có" },
    {
      field: 'createdDate',
      headerName: 'Ngày tạo yêu cầu',
      flex: 1.5,
      minWidth: 150,
      editable: false,
      renderCell: (params) => dayjs(params.value).format("DD/MM/YYYY"),
    },
    {
      field: 'status',
      headerName: 'Trạng thái',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                ${params.value === 'Đã duyệt'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
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
      minWidth: 50,
      renderCell: (params) => (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Tooltip content="Chỉnh sửa">
            <button className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white">
              <BiSolidEdit className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>

      ),
    },
  ];

  const data = purchaseRequests.map((request, index) => ({
    id: request.id,
    index: (currentPage * pageSize) + index + 1,
    purchaseRequestCode: request.purchaseRequestCode,
    purchaseOrderCode: request.purchaseOrderCode || "Chưa có",
    createdDate: request.createdDate,
    status: request.status,
  }));

  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">

        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title="Danh sách yêu cầu mua vật tư"
            onAdd={handleAddRequest}
            addButtonLabel="Thêm yêu cầu"
            showImport={false} // Ẩn nút import nếu không dùng
            showExport={false} // Ẩn xuất file nếu không dùng
          />
          <div className="py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
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
                bản ghi mỗi trang
              </Typography>
            </div>
            <TableSearch
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={() => {
              }}
              placeholder="Tìm kiếm đối tác"
            />
          </div>

          <Table
            data={data}
            columnsConfig={columnsConfig}
            enableSelection={true}
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

export default PurchaseRequestPage;
