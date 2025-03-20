import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactPaginate from "react-paginate";
import { Button, Card, CardHeader, CardBody, Typography, Tooltip } from "@material-tailwind/react";
import { BiSolidEdit } from "react-icons/bi";
import { FaEdit, FaEye } from "react-icons/fa";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";
import useReceiptNote from './useReceiptNote';

const ReceiptNotePage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  
  const {
    receiptNotes,
    totalPages,
    totalElements,
    fetchPaginatedReceiptNotes
  } = useReceiptNote();

  // Fetch data on component mount and when page or size changes
  useEffect(() => {
    fetchPaginatedReceiptNotes(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Handle page change
  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage);
  };

  // Handle page change from ReactPaginate
  const handlePageChangeWrapper = (selectedItem) => {
    handlePageChange(selectedItem.selected);
  };

  // Handle view or edit receipt
  const handleViewReceipt = (receipt) => {
    navigate(`/user/receiptNote/view/${receipt.grnId}`);
  };

  // Handle search
  const handleSearch = () => {
    // Reset to first page when searching
    setCurrentPage(0);
    fetchPaginatedReceiptNotes(0, pageSize, searchTerm);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch (error) {
      return dateString;
    }
  };

  const columnsConfig = [
    { field: 'receiptCode', headerName: 'Mã phiếu nhập', flex: 1.5, minWidth: 150, editable: false },
    { field: 'category', headerName: 'Loại hàng hóa', flex: 2, minWidth: 100, editable: false },
    { field: 'reason', headerName: 'Lý do nhập', flex: 1.5, minWidth: 300, editable: false },
    {
      field: 'createdDate',
      headerName: 'Ngày lập phiếu',
      flex: 1.5,
      minWidth: 150,
      editable: false,
      renderCell: (params) => new Date(params.value).toLocaleDateString("vi-VN"),
    },
    { field: 'createBy', headerName: 'Người tạo phiếu', flex: 1.5, minWidth: 100, editable: false },
    { field: 'reference', headerName: 'Tham chiếu', flex: 1.5, minWidth: 150, editable: false, renderCell: (params) => params.value || "N/A" },
    {
      field: 'actions',
      headerName: 'Hành động',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Tooltip content="Chỉnh sửa">
            <button className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
              onClick={() => handleEdit(params.row)}
            >
              <BiSolidEdit className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const data = receiptNotes.map((receipt) => ({
    receiptCode: receipt.grnCode,
    category: receipt.category || 'không có dữ liệu',
    // supplierName: receipt.supplierName,
    reason: receipt.description,
    createdDate: receipt.receiptDate,
    createBy: receipt.createdBy,
    reference: receipt.reference || "N/A",
  }));

  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title="Danh sách phiếu nhập kho"
            addButtonLabel="Thêm phiếu nhập"
            onAdd={() => navigate("/user/receiptNote/add")}
            onImport={() => {/* Import functionality */}}
            onExport={() => {/* Export functionality */}}
          />
          
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
              onSearch={handleSearch}
              placeholder="Tìm kiếm phiếu nhập"
            />
          </div>

          <Table
            data={data}
            columnsConfig={columnsConfig}
            enableSelection={false}
          />


          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-blue-gray-50 py-4">
            <div className="flex items-center gap-2">
              <Typography variant="small" color="blue-gray" className="font-normal">
                Trang {currentPage + 1} / {totalPages || 1} • {totalElements || 0} bản ghi
              </Typography>
            </div>
            <ReactPaginate
              previousLabel={<ArrowLeftIcon strokeWidth={2} className="h-4 w-4" />}
              nextLabel={<ArrowRightIcon strokeWidth={2} className="h-4 w-4" />}
              breakLabel="..."
              pageCount={totalPages || 1}
              marginPagesDisplayed={2}
              pageRangeDisplayed={5}
              onPageChange={handlePageChangeWrapper}
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

export default ReceiptNotePage;