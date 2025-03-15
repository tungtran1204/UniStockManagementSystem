import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { Button, Card, CardHeader, CardBody, Typography, Tooltip } from "@material-tailwind/react";
import { BiSolidEdit } from "react-icons/bi";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";


const ReceiptNotePage = () => {
  const [importReceipts, setImportReceipts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  useEffect(() => {
    fetchPaginatedImportReceipts();
  }, [currentPage, pageSize]);

  const fetchPaginatedImportReceipts = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/import-receipts", {
        params: { page: currentPage, size: pageSize },
      });

      if (response.data && response.data.content) {
        setImportReceipts(response.data.content);
        setTotalPages(response.data.totalPages || 1);
        setTotalElements(response.data.totalElements || response.data.content.length);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phiếu nhập:", error);
      setImportReceipts([]);
      setTotalPages(1);
      setTotalElements(0);
    }
  };

  const handleEdit = (receipt) => {
    setSelectedReceipt(receipt);
    setShowEditModal(true);
  };

  const handleCreateReceiptSuccess = () => {
    fetchPaginatedImportReceipts();
    setShowCreatePopup(false);
  };

  const handlePageChangeWrapper = (selectedItem) => {
    handlePageChange(selectedItem.selected);
  };

  const columnsConfig = [
    { field: 'receiptCode', headerName: 'Mã phiếu nhập', flex: 1.5, minWidth: 150, editable: false },
    { field: 'warehouseName', headerName: 'Nhập kho', flex: 2, minWidth: 100, editable: false },
    { field: 'supplierName', headerName: 'Nhập từ', flex: 1.5, minWidth: 100, editable: false },
    { field: 'reason', headerName: 'Lý do nhập', flex: 1.5, minWidth: 300, editable: false },
    {
      field: 'createdDate',
      headerName: 'Ngày lập phiếu',
      flex: 1.5,
      minWidth: 150,
      editable: false,
      renderCell: (params) => new Date(params.value).toLocaleDateString("vi-VN"),
    },
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

  const data = importReceipts.map((receipt) => ({
    id: receipt.receiptId,
    receiptCode: receipt.receiptCode,
    warehouseName: receipt.warehouseName,
    supplierName: receipt.supplierName,
    reason: receipt.reason,
    createdDate: receipt.createdDate,
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
            onImport={() => setShowImportPopup(true)}
            onExport={() => { /* export Excel */ }}
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
              onSearch={() => {
                // Thêm hàm xử lý tìm kiếm vào đây nếu có
                console.log("Tìm kiếm kho:", searchTerm);
              }}
              placeholder="Tìm kiếm kho"
            />
          </div>

          <Table
            data={data}
            columnsConfig={columnsConfig}
            enableSelection={false}
          />


          {/* Phần phân trang mới sử dụng ReactPaginate */}
          <div className="flex items-center justify-between border-t border-blue-gray-50 py-4">
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
