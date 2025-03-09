import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { Button, Card, CardHeader, CardBody, Typography, Tooltip } from "@material-tailwind/react";
import { FaEdit, FaFileExcel, FaPlus } from "react-icons/fa";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';


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

  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  return (
    <div className="mb-8 flex flex-col gap-12">
      <Card className="bg-gray-100 p-7">
        <PageHeader
          title="Danh sách phiếu nhập kho"
          addButtonLabel="Thêm phiếu nhập"
          onAdd={() => setShowCreatePopup(true)}
          onImport={() => setShowImportPopup(true)}
          onExport={() => { /* export Excel */ }}
        />
        <CardBody className="pb-2 bg-white rounded-xl">
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
          <table className="w-full min-w-[640px] table-auto border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                {["Mã phiếu nhập", "Nhập kho", "Nhập từ", "Lý do nhập", "Ngày lập phiếu", "Tham chiếu", "Thao tác"].map((header) => (
                  <th key={header} className="border border-gray-300 px-4 py-2 text-left text-sm font-bold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {importReceipts.length > 0 ? (
                importReceipts.map((receipt, index) => (
                  <tr key={receipt.receiptId} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">{receipt.receiptCode}</td>
                    <td className="border border-gray-300 px-4 py-2">{receipt.warehouseName}</td>
                    <td className="border border-gray-300 px-4 py-2">{receipt.supplierName}</td>
                    <td className="border border-gray-300 px-4 py-2">{receipt.reason}</td>
                    <td className="border border-gray-300 px-4 py-2">{receipt.createdDate}</td>
                    <td className="border border-gray-300 px-4 py-2">{receipt.reference || "N/A"}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      <Tooltip content="Chỉnh sửa">
                        <button onClick={() => handleEdit(receipt)} className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white">
                          <FaEdit className="h-4 w-4" />
                        </button>
                      </Tooltip>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="border border-gray-300 px-4 py-2 text-center">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex justify-between p-4">
            <Typography variant="small" color="blue-gray">
              Trang {currentPage + 1} / {totalPages} - {totalElements} phiếu nhập
            </Typography>
            <ReactPaginate
              previousLabel={<ArrowLeftIcon className="h-4 w-4" />}
              nextLabel={<ArrowRightIcon className="h-4 w-4" />}
              pageCount={totalPages}
              onPageChange={handlePageChange}
              containerClassName="flex items-center gap-1"
              activeClassName="bg-blue-500 text-white"
            />
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default ReceiptNotePage;
