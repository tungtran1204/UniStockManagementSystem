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
import { FaEdit, FaPlus, FaAngleLeft, FaAngleRight } from "react-icons/fa";
import ModalAddWarehouse from "./ModalAddWarehouse"; // Import ModalAddWarehouse component
import ModalEditWarehouse from "./ModalEditWarehouse"; // Import ModalEditWarehouse component
import ReactPaginate from "react-paginate"; // Import ReactPaginate for pagination
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';

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
      const warehouseData = await getWarehouseById(warehouse.warehouseId);
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

  // Filter warehouses based on search term
  const filteredWarehouses = warehouses.filter(
    (warehouse) =>
      (warehouse.warehouseCode && warehouse.warehouseCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (warehouse.warehouseName && warehouse.warehouseName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="mb-8 flex flex-col gap-12">
      <Card className="bg-gray-100 p-7">
        <PageHeader
          title="Danh sách kho"
          addButtonLabel="Thêm kho"
          onAdd={() => setOpenAddModal(true)}
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

          <table className="w-full min-w-[640px] table-auto border border-gray-200">
            <thead>
              <tr>
                {["Mã kho", "Tên kho", "Trạng thái", "Hành động"].map((el) => (
                  <th
                    key={el}
                    className="border-b border-blue-gray-50 py-3 px-5 text-left"
                  >
                    <Typography
                      variant="small"
                      className="text-[11px] font-bold uppercase text-blue-gray-400"
                    >
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredWarehouses.length > 0 ? (
                filteredWarehouses.map(({ warehouseId, warehouseCode, warehouseName, warehouseDescription, isActive }, key) => {
                  const className = `py-3 px-5 ${key === filteredWarehouses.length - 1 ? "" : "border-b border-blue-gray-50"
                    }`;

                  return (
                    <tr key={warehouseId}>
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {warehouseCode}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray" className="text-xs">
                          {warehouseName}
                        </Typography>


                      </td>

                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Switch
                            color="green"
                            checked={isActive}
                            onChange={() => {
                              const confirmMessage = isActive
                                ? "Bạn có chắc muốn vô hiệu hóa kho này không?"
                                : "Bạn có chắc muốn kích hoạt kho này không?";

                              if (window.confirm(confirmMessage)) {
                                console.log("Toggling warehouse:", warehouseId, "Current status:", isActive);
                                toggleStatus(warehouseId, isActive);
                              }
                            }
                            }
                          />
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {isActive ? "Đang hoạt động" : "Không hoạt động"}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Edit">
                            <button
                              onClick={() => handleEditWarehouse({ warehouseId, warehouseCode, warehouseName, warehouseDescription, isActive })}
                              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <FaEdit />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="border-b border-gray-200 px-3 py-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
          <div className="flex items-center gap-2">
            <Typography variant="small" color="blue-gray" className="font-normal">
              Trang {currentPage + 1} / {totalPages} • {totalElements} kho hàng
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
            activeClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
            forcePage={currentPage}
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        </div>
      </Card>

      {/* Modal Add Warehouse */}
      {openAddModal && <ModalAddWarehouse show={openAddModal} onClose={() => setOpenAddModal(false)} onAdd={() => fetchPaginatedWarehouses(currentPage, pageSize)} />}

      {/* Modal Edit Warehouse */}
      {openEditModal && <ModalEditWarehouse open={openEditModal} onClose={() => setOpenEditModal(false)} warehouse={selectedWarehouse} fetchWarehouses={fetchPaginatedWarehouses} />}
    </div>
  );
};

export default WarehousePage;