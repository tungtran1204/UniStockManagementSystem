import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProduct from "./useProduct";
import { Button } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import {
  IconButton,
} from '@mui/material';
import {
  VisibilityOutlined,
} from '@mui/icons-material';
import ReactPaginate from "react-paginate";
import ImportProductModal from "./ImportProductModal";
import {
  importExcel,
  exportExcel,
  createProduct,
  previewImport,
  fetchUnits,
  fetchProductTypes,
} from "./productService";
import {
  Card,
  CardBody,
  Typography,
  Tooltip,
  Switch,
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
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewResults, setPreviewResults] = useState([]);
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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setLocalLoading(true);
    try {
      const preview = await previewImport(file);
      setPreviewResults(preview);
    } catch (err) {
      console.error("Lỗi preview:", err);
      alert("❌ Lỗi khi kiểm tra file. Vui lòng thử lại.");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;
    setLocalLoading(true);
    try {
      await importExcel(selectedFile);
      alert("✅ Import thành công!");
      setPreviewResults([]);
      setSelectedFile(null);
      fetchPaginatedProducts();
    } catch (err) {
      alert("❌ Import thất bại: " + (err.response?.data || err.message));
    } finally {
      setLocalLoading(false);
    }
  };

  const handleEdit = (product) => {
    navigate(`/user/products/${product.productId}`);
  };

  const handleUpdateSuccess = () => {
    fetchPaginatedProducts();
  };

  const handlePageChangeWrapper = (selectedItem) => {
    handlePageChange(selectedItem.selected);
  };

  const handleAddProduct = () => {
    navigate("/user/products/add");
  };

  // Hàm xử lý export với xác nhận
  const handleExport = () => {
    const confirmExport = window.confirm("Bạn có muốn xuất danh sách sản phẩm ra file Excel không?");
    if (confirmExport) {
      setLocalLoading(true);
      exportExcel()
        .then((blob) => {
          const url = window.URL.createObjectURL(new Blob([blob]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "products_export.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          alert("✅ Xuất file Excel thành công!");
        })
        .catch((err) => {
          alert("❌ Lỗi khi xuất file Excel: " + (err.message || "Không xác định"));
        })
        .finally(() => {
          setLocalLoading(false);
        });
    }
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
            <div
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                      ${params.value ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                }`}
            >
              {params.value ? "Đang sản xuất" : "Ngừng sản xuất"}
            </div>
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
          <Tooltip content="Xem chi tiết">
            <IconButton
              size="small"
              color="primary"
              onClick={() => navigate(`/user/products/${params.row.id}`)}
            >
              <VisibilityOutlined />
            </IconButton>
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

  const hasInvalidRows = previewResults.some((row) => row.valid === false);

  return (
    <div className="mb-8 flex flex-col gap-12" style={{ height: 'calc(100vh-100px)' }}>
      <Card className="bg-gray-50 p-7 rounded-none shadow-none">
        <CardBody className="pb-2 bg-white rounded-xl">
          <PageHeader
            title="Danh sách sản phẩm"
            addButtonLabel="Thêm sản phẩm"
            onAdd={handleAddProduct}
            onImport={() => setShowImportPopup(true)}
            onExport={handleExport} // Sử dụng hàm handleExport mới
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
        <ImportProductModal
          open={showImportPopup}
          onClose={() => setShowImportPopup(false)}
          onSuccess={fetchPaginatedProducts}
        />
      )}
    </div>
  );
};

export default ProductPage;