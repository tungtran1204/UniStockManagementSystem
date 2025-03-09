import React, { useState, useEffect } from "react";
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

const PurchaseOrderPage = () => {
  const navigate = useNavigate();

  const statuses = ["Chờ nhận", "Đang giao", "Hoàn thành", "Hủy"];

  // Danh sách đơn đặt hàng (Dữ liệu mẫu)
  const purchaseOrders = [
    { id: 8, code: "MH08", supplierId: "NCC25", supplierName: "BH123", address: "462 South Street, Detroit, MI", contact: "Ryan", phone: "(708) 543-7168", createdAt: "18/06/2021", status: "Chờ nhận" },
    { id: 34, code: "MH34", supplierId: "NCC85", supplierName: "BH65", address: "1328 Madison Ave, Cleveland, OH", contact: "Joseph", phone: "(937) 876-1890", createdAt: "24/05/2024", status: "Đang giao" },
    { id: 51, code: "MH51", supplierId: "NCC05", supplierName: "BH57", address: "442 Rose Street, Apt. 5B", contact: "Samantha", phone: "(717) 781-2042", createdAt: "21/03/2023", status: "Hoàn thành" },
    { id: 27, code: "MH27", supplierId: "NCC95", supplierName: "BH35", address: "5007 Ocean Ave, Charlotte, NC", contact: "Brandon", phone: "(610) 743-8021", createdAt: "05/08/2022", status: "Hủy" },
    { id: 43, code: "MH43", supplierId: "NCC14", supplierName: "BH39", address: "9343 Mountain St, Milwaukee, WI", contact: "Daniel", phone: "(719) 814-8261", createdAt: "07/01/2022", status: "Đang giao" },
    { id: 38, code: "MH38", supplierId: "NCC79", supplierName: "BH97", address: "7678 Beach St, Baltimore, MD", contact: "Savannah", phone: "(806) 472-1493", createdAt: "28/09/2022", status: "Trả hàng" },
    { id: 41, code: "MH41", supplierId: "NCC36", supplierName: "BH19", address: "1456 South St, Phoenix, AZ", contact: "John", phone: "(937) 876-1890", createdAt: "26/10/2021", status: "Chờ nhận" },
    { id: 35, code: "MH35", supplierId: "NCC73", supplierName: "BH17", address: "7342 Park Ave, Nashville, TN", contact: "Emma", phone: "(508) 514-7102", createdAt: "20/05/2022", status: "Chờ nhận" },
    { id: 6, code: "MH06", supplierId: "NCC56", supplierName: "BH48", address: "1245 North Main St, Wichita, KS", contact: "Julia", phone: "(847) 591-0496", createdAt: "02/12/2021", status: "Chờ nhận" },
    { id: 88, code: "MH88", supplierId: "NCC59", supplierName: "BH49", address: "1328 Madison Ave, Cleveland, OH", contact: "David", phone: "(716) 483-2483", createdAt: "29/01/2021", status: "Chờ nhận" },
  ];

  // State cho tìm kiếm và filter
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");


  // Hàm sắp xếp
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };


  // Lọc danh sách đơn hàng
  const filteredOrders = purchaseOrders
    .filter((order) =>
      Object.values(order).some((value) =>
        value.toString().toLowerCase().includes(searchKeyword.toLowerCase())
      ) && (selectedStatus ? order.status === selectedStatus : true)
    )
    .sort((a, b) => {
      if (!sortColumn) return 0;
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];

      if (sortColumn === "Ngày tạo đơn") {
        valueA = new Date(a.createdAt.split("/").reverse().join("-"));
        valueB = new Date(b.createdAt.split("/").reverse().join("-"));
      }

      if (sortDirection === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  // Phân trang
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const totalElements = filteredOrders.length;
  const totalPages = Math.ceil(totalElements / pageSize);
  const displayedOrders = filteredOrders.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const handlePageChange = ({ selected }) => setCurrentPage(selected);

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(totalPages > 0 ? totalPages - 1 : 0);
    }
  }, [purchaseOrders, totalPages]);


  const [selectedOrders, setSelectedOrders] = useState([]);

  const toggleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((orderId) => orderId !== id) : [...prev, id]
    );
  };

  const printOrders = () => {
    alert(`In các đơn hàng: ${selectedOrders.join(", ")}`);
  };

  return (
    <div className="mt-6 mb-8 flex flex-col gap-6">
      <Card>
        {/* Header */}
        <CardHeader variant="gradient" color="gray" className="mb-6 p-4 flex justify-between items-center">
          <Typography variant="h6" color="white">
            Danh sách đơn mua hàng
          </Typography>
          <div className="flex gap-2">
            <Button color="blue" onClick={() => navigate("/create-order")}>+ Thêm</Button>
            <Button color="green" onClick={printOrders}>In đơn</Button>
          </div>
        </CardHeader>

        <CardBody className="px-6 text-sm">
          {/* Thanh điều khiển phân trang */}
          <div className="px-4 py-2 flex items-center gap-4 mb-4">
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
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <Typography variant="small" color="blue-gray" className="font-normal whitespace-nowrap">
              bản ghi mỗi trang
            </Typography>


            {/* Thanh tìm kiếm */}

            <Input
              type="text"
              label="Tìm kiếm..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </div>

          {/* Bảng dữ liệu */}
          <div className="overflow-auto border rounded">
            <table className="w-full table-auto text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">
                    <input type="checkbox" />
                  </th>
                  <th className="p-2 border">Mã đơn
                    <button onClick={() => handleSort("code")} className="ml-1 inline-block">
                      {sortColumn === "code" ? (
                        sortDirection === "asc" ? <ChevronUpIcon className="h-4 w-4 text-black" /> : <ChevronDownIcon className="h-4 w-4 text-black" />
                      ) : <ChevronUpIcon className="h-4 w-4 text-gray-400" />}
                    </button>
                  </th>
                  <th className="p-2 border">Mã NCC</th>
                  <th className="p-2 border">Tên NCC</th>
                  <th className="p-2 border">Địa chỉ</th>
                  <th className="p-2 border">Người liên hệ</th>
                  <th className="p-2 border">Số điện thoại</th>
                  <th className="p-2 border">Ngày tạo đơn
                    <button onClick={() => handleSort("code")} className="ml-1 inline-block">
                      {sortColumn === "code" ? (
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
                {displayedOrders.map((order) => (
                  <tr key={order.id} className="text-center">
                    <td className="p-2 border">
                      <input type="checkbox" checked={selectedOrders.includes(order.id)} onChange={() => toggleSelectOrder(order.id)} />
                    </td>
                    <td className="p-2 border">{order.code}</td>
                    <td className="p-2 border">{order.supplierId}</td>
                    <td className="p-2 border">{order.supplierName}</td>
                    <td className="p-2 border">{order.address}</td>
                    <td className="p-2 border">{order.contact}</td>
                    <td className="p-2 border">{order.phone}</td>
                    <td className="p-2 border">{order.createdAt}</td>
                    <td className="p-2 border font-semibold text-sm">{order.status}</td>
                    <td className="p-2 border">
                      <EyeIcon className="h-5 w-5 text-blue-500 cursor-pointer" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Phân trang */}
          {totalElements > 0 && (
            <div className="flex justify-between p-4 border-t">
              <Typography variant="small">
                Trang {currentPage + 1} / {totalPages} • {totalElements} bản ghi
              </Typography>
              <ReactPaginate
                previousLabel={<ArrowLeftIcon className="h-4 w-4" />}
                nextLabel={<ArrowRightIcon className="h-4 w-4" />}
                pageCount={totalPages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                containerClassName="flex items-center gap-2"
                pageClassName="h-8 min-w-[32px] flex items-center justify-center rounded-md text-xs text-gray-700 border border-gray-300 hover:bg-gray-100"
                activeClassName="bg-blue-500 text-white"
                disabledClassName="opacity-50 cursor-not-allowed"
              />
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default PurchaseOrderPage;
