import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { Button, Card, CardHeader, CardBody, Typography, Tooltip } from "@material-tailwind/react";
import { FaEdit, FaFileExcel, FaPlus } from "react-icons/fa";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";


const ReceiptNotePage = () => {
  const [importReceipts, setImportReceipts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const navigate = useNavigate();

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
    <div className="mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="gray" className="mb-8 p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">
              Danh sách phiếu nhập kho
            </Typography>
            <div className="flex gap-2">
              <Button size="sm" color="white" variant="text" className="flex items-center gap-2" onClick={() => navigate("/user/receiptNote/add")}>
                <FaPlus className="h-4 w-4" /> Thêm phiếu nhập
              </Button>
              <Button size="sm" color="white" variant="text" className="flex items-center gap-2">
                <FaFileExcel className="h-4 w-4" /> Import Excel
              </Button>
              <Button size="sm" color="white" variant="text" className="flex items-center gap-2">
                <FaFileExcel className="h-4 w-4" /> Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-auto px-4 py-2">
          <table className="w-full min-w-[640px] border-collapse border border-gray-300">
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
