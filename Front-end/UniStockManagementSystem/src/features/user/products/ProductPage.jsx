import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProduct from "./useProduct";
import { Button, IconButton } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FaEdit, FaFileExcel, FaPlus } from "react-icons/fa";
import { BiSolidEdit } from "react-icons/bi";
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
import Table from "@/components/Table";

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

  const columnsConfig = [
    { field: 'productCode', headerName: 'Mã sản phẩm', flex: 1, minWidth: 50, editable: false, filterable: false },
    { field: 'productName', headerName: 'Tên sản phẩm', flex: 2, minWidth: 300, editable: false, filterable: false },
    {
      field: 'unitName',
      headerName: 'Đơn vị',
      flex: 1,
      minWidth: 50,
      editable: false,
      filterable: false,
    },
    {
      field: 'productTypeName',
      headerName: 'Dòng sản phẩm',
      flex: 1.5,
      minWidth: 120,
      editable: false,
      filterable: false,
    },
    {
      field: 'imageUrl',
      headerName: 'Hình ảnh',
      flex: 1,
      minWidth: 150,
      editable: false,
      filterable: false,
      renderCell: (params) => {
        return params.value ? (
          <img
            src={params.value}
            alt="Hình ảnh sản phẩm"
            className="w-12 h-12 object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = 'N/A';
            }}
          />
        ) : (
          <Typography className="text-xs text-gray-600">Không có ảnh</Typography>
        );
      },
    },
    {
      field: 'isProductionActive',
      headerName: 'Trạng thái',
      flex: 1,
      minWidth: 200,
      editable: false,
      filterable: false,
      renderCell: (params) => {
        return (
          <div className="flex items-center gap-2">
            <Switch
              color="green"
              checked={params.value}
              onChange={() => handleToggleStatus(params.row.id)}
            />
            <Typography className="text-xs font-semibold text-blue-gray-600">
              {params.value ? "Đang sản xuất" : "Ngừng sản xuất"}
            </Typography>
          </div>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Hành động',
      flex: 0.5,
      minWidth: 50,
      renderCell: (params) => (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <Tooltip content="Chỉnh sửa">
            <button
              onClick={() => navigate(`/user/products/${params.row.id}`)}
              className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              <BiSolidEdit className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>  
      ),
    },
  ];

  const data = products.map((product) => ({
    id: product.productId,
    productCode: product.productCode || "N/A",
    productName: product.productName,
    unitName: product.unitName || "N/A",
    productTypeName: productTypes.find(type => type.typeId === product.typeId)?.typeName || product.typeName || "N/A",
    imageUrl: product.imageUrl || "N/A",
    isProductionActive: !!product.isProductionActive,
  }));



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

          <Table
            data={data}
            columnsConfig={columnsConfig}
            enableSelection={false}
          />

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