import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProduct from "./useProduct";
import { Button, IconButton } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FaEdit, FaFileExcel, FaPlus } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import axios from "axios";
import {
  importExcel,
  exportExcel,
  createProduct,
  fetchUnits,
  fetchProductTypes,
} from "./productService";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tooltip,
  Switch,
  Input,
} from "@material-tailwind/react";
import PageHeader from '@/components/PageHeader';
import TableSearch from '@/components/TableSearch';

const ProductPage = () => {
  const navigate = useNavigate();
  // Sử dụng useProduct hook
  const {
    products,
    loading,
    currentPage,
    pageSize,
    totalPages,
    totalElements,
    fetchPaginatedProducts,
    handleToggleStatus,
    handlePageChange,
    handlePageSizeChange
  } = useProduct();

  // Các state trong component
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [file, setFile] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term

  const [newProduct, setNewProduct] = useState({
    productCode: "",
    productName: "",
    description: "",
    unitId: "",
    typeId: "",
    isProductionActive: "true"
  });

  // Fetch unit và product types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitsData, typesData] = await Promise.all([
          fetchUnits(),
          fetchProductTypes()
        ]);

        console.log("Fetched units:", unitsData);
        console.log("Fetched productTypes:", typesData);

        setUnits(Array.isArray(unitsData) ? unitsData : []);
        setProductTypes(Array.isArray(typesData) ? typesData : []);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn vị và dòng sản phẩm:", error);
        setUnits([]);
        setProductTypes([]);
      }
    };
    fetchData();
  }, []);

  const handleEdit = (product) => {
    navigate(`/user/products/${product.productId}`);
  };

  const handleUpdateSuccess = () => {
    fetchPaginatedProducts();
  };

  const handleImport = async () => {
    if (!file) {
      alert("Vui lòng chọn file Excel!");
      return;
    }

    setLocalLoading(true);
    try {
      await importExcel(file);
      alert("Import thành công!");
      fetchPaginatedProducts();
      setShowImportPopup(false);
      setFile(null);
    } catch (error) {
      console.error("Lỗi khi import file:", error);
      alert("Lỗi import file! Kiểm tra lại dữ liệu.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePageChangeWrapper = (selectedItem) => {
    handlePageChange(selectedItem.selected);
  };

  const handleAddProduct = () => {
    navigate("/user/products/add");
  };

  // Add this function
  const filteredProducts = Array.isArray(products)
    ? products.filter(product =>
      product.productCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : [];

  return (
    <div className="mb-8 flex flex-col gap-12" tyle={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">

        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title="Danh sách sản phẩm"
            addButtonLabel="Thêm sản phẩm"
            onAdd={handleAddProduct}
            onImport={() => setShowImportPopup(true)}
            onExport={exportExcel}
          />
          {/* Phần chọn số items/trang */}
          <div className="py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Typography variant="small" color="blue-gray" className="font-light">
                Hiển thị
              </Typography>
              <select
                value={pageSize}
                onChange={(e) => {
                  handlePageSizeChange(Number(e.target.value));
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
            <TableSearch
              value={searchTerm}
              onChange={setSearchTerm}
              onSearch={() => {
                // Thực hiện tìm kiếm hoặc gọi API ở đây
              }}
              placeholder="Tìm kiếm sản phẩm"
            />
          </div>

          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "STT",
                  "Mã sản phẩm",
                  "Tên sản phẩm",
                  "Đơn vị",
                  "Dòng sản phẩm",
                  "Hình ảnh",
                  "Trạng thái",
                  "Thao tác",
                ].map((el) => (
                  <th key={el} className="border-b border-blue-gray-50 py-3 px-5 text-left">
                    <Typography variant="small" className="text-[11px] font-bold uppercase text-blue-gray-400">
                      {el}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => {
                  const className = `py-3 px-5 ${index === products.length - 1 ? "" : "border-b border-blue-gray-50"}`;
                  const actualIndex = currentPage * pageSize + index + 1;

                  return (
                    <tr key={product.productId}>
                      <td className={className}>
                        <Typography variant="small" color="blue-gray" className="font-semibold">
                          {actualIndex}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {product.productCode || "N/A"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {product.productName}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {product.unitName || "N/A"}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography className="text-xs font-normal text-blue-gray-600">
                          {product.typeName || "N/A"}
                        </Typography>
                      </td>
                      <td className={className}>
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.productName}
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => {
                              const imgElement = e.target;
                              imgElement.style.display = 'none';
                              imgElement.parentElement.innerHTML = 'Không có ảnh';
                            }}
                          />
                        ) : (
                          <Typography className="text-xs font-normal text-gray-600">
                            Không có ảnh
                          </Typography>
                        )}
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Switch
                            color="green"
                            checked={!!product.isProductionActive}
                            onChange={() => {
                              if (!product.productId) {
                                console.error("❌ Lỗi: Sản phẩm không có ID!", product);
                                alert("Lỗi: Sản phẩm không có ID!");
                                return;
                              }
                              handleToggleStatus(product.productId);
                            }}
                          />
                          <Typography className="text-xs font-semibold text-blue-gray-600">
                            {product.isProductionActive ? "Đang sản xuất" : "Ngừng sản xuất"}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Chỉnh sửa">
                            <button
                              onClick={() => navigate(`/user/products/${product.productId}`)}
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
                  <td colSpan="8" className="border-b border-gray-200 px-3 py-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
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
              activeClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
              forcePage={currentPage}
              disabledClassName="opacity-50 cursor-not-allowed"
            />
          </div>
        </CardBody>
      </Card>

      {showImportPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">Import Excel</Typography>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowImportPopup(false)}
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                color="gray"
                onClick={() => setShowImportPopup(false)}
                disabled={localLoading}
              >
                Hủy
              </Button>
              <Button
                color="blue"
                onClick={handleImport}
                disabled={localLoading}
              >
                {localLoading ? "Đang xử lý..." : "Import"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;