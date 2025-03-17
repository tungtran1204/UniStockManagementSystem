import React, { useEffect, useState } from "react";
import useWarehouse from "./useWarehouse";
import { updateWarehouseStatus, createWarehouse, fetchWarehouses } from "./warehouseService";
import { getWarehouseById } from "./warehouseService";
import { useNavigate } from "react-router-dom";
import { BiExport, BiImport, BiSearch } from "react-icons/bi";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tooltip,
  Button,
  Input,
  Switch,
  Avatar,
} from "@material-tailwind/react";
import { BiSolidEdit } from "react-icons/bi";
import ModalAddWarehouse from "./ModalAddWarehouse"; // Import ModalAddWarehouse component
import ModalEditWarehouse from "./ModalEditWarehouse"; // Import ModalEditWarehouse component
import ReactPaginate from "react-paginate"; // Import ReactPaginate for pagination
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';
import Table from "@/components/Table";

// Define the WarehousePage component
const WarehousePage = () => {
  // Destructure values from useWarehouse hook
  const { warehouses, fetchPaginatedWarehouses, toggleStatus, totalPages, totalElements } = useWarehouse();
  const navigate = useNavigate(); // Hook for navigation
  const [openAddModal, setOpenAddModal] = useState(false); // State to control Add Modal visibility
  const [openEditModal, setOpenEditModal] = useState(false); // State to control Edit Modal visibility
  const [selectedWarehouse, setSelectedWarehouse] = useState(null); // State to store selected warehouse for editing
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  // State for pagination
  const [currentPage, setCurrentPage] = useState(0); // Current page number
  const [pageSize, setPageSize] = useState(5); // Number of warehouses per page

  // Fetch warehouses when the component mounts or pagination changes
  useEffect(() => {
    fetchPaginatedWarehouses(currentPage, pageSize);
  }, [currentPage, pageSize]);

  // Handle edit warehouse action
  const handleEditWarehouse = async (warehouse) => {
    try {
      const warehouseData = await getWarehouseById(warehouse.id);
      setSelectedWarehouse(warehouseData);
      setOpenEditModal(true);
    } catch (error) {
      console.error(" Error fetching warehouse data:", error);
      alert("Unable to fetch warehouse data!");
    }
  };

  // Handle page change for pagination
  const handlePageChange = (selectedItem) => {
    setCurrentPage(selectedItem.selected);
  };

  const columnsConfig = [
    { field: 'warehouseCode', headerName: 'Mã kho', flex: 1, minWidth: 50, editable: false },
    { field: 'warehouseName', headerName: 'Tên kho', flex: 2, minWidth: 600, editable: false },
    {
      field: 'isActive',
      headerName: 'Trạng thái',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => (
        <div className="flex items-center gap-2">
          <Switch
            color="green"
            checked={params.value}
            onChange={() => {
              const confirmMessage = params.value
                ? "Bạn có chắc muốn vô hiệu hóa kho này không?"
                : "Bạn có chắc muốn kích hoạt kho này không?";

              if (window.confirm(confirmMessage)) {
                toggleStatus(params.row.id, params.value);
              }
            }}
          />
          <Typography className="text-xs font-semibold text-blue-gray-600">
            {params.value ? "Đang hoạt động" : "Không hoạt động"}
          </Typography>
        </div>
      ),
    },
    {
      field: 'actions',
      headerName: 'Hành động',
      flex: 0.5,
      minWidth: 100,
      renderCell: (params) => (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Tooltip content="Chỉnh sửa">
            <button
              onClick={() => handleEditWarehouse(params.row)}
              className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <BiSolidEdit className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const data = warehouses.map((warehouse) => ({
    id: warehouse.warehouseId,
    warehouseCode: warehouse.warehouseCode,
    warehouseName: warehouse.warehouseName,
    isActive: warehouse.isActive,
  }));


  // Filter warehouses based on search term
  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      (warehouse.warehouseCode && warehouse.warehouseCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (warehouse.warehouseName && warehouse.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title="Danh sách kho"
            addButtonLabel="Thêm kho"
            onAdd={() => setOpenAddModal(true)}
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


          {/* Pagination */}
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

      {/* Modal Add Warehouse */}
      {openAddModal && <ModalAddWarehouse show={openAddModal} onClose={() => setOpenAddModal(false)} onAdd={() => fetchPaginatedWarehouses(currentPage, pageSize)} />}

      {/* Modal Edit Warehouse */}
      {openEditModal && <ModalEditWarehouse open={openEditModal} onClose={() => setOpenEditModal(false)} warehouse={selectedWarehouse} fetchWarehouses={fetchPaginatedWarehouses} />}
    </div>
  );
};

export default WarehousePage;