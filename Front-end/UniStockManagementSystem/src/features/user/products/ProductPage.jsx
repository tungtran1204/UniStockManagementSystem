import React, { useEffect, useState } from "react";
import useProduct from "./useProduct";
import EditProductModal from './EditProductModal';
import CreateProductModal from './CreateProductModal';
import { Button, IconButton } from "@material-tailwind/react";
import { ArrowRightIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { FaLayerGroup } from "react-icons/fa";
import { FaEdit, FaFileExcel, FaPlus } from "react-icons/fa";
import BillOfMaterialsModal from "./BillOfMaterialsModal";
import ReactPaginate from "react-paginate";

import axios from "axios";
import {
  importExcel,
  exportExcel,
  createProduct,
  fetchUnits,
  fetchProductTypes,
  checkProductCodeExists
} from "./productService";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tooltip,
  Switch,
} from "@material-tailwind/react";

const ProductPage = () => {
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [selectedProductForMaterials, setSelectedProductForMaterials] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [products, setProducts] = useState([]);
  
  const [errors, setErrors] = useState({
    productCode: "",
    productName: "",
    unitId: "",
    typeId: "",
    price: "",
    description: ""
  });

  const [newProduct, setNewProduct] = useState({
    productCode: "",
    productName: "",
    description: "",
    unitId: "",
    typeId: "",
    price: "",
    isProductionActive: "true"
  });

  useEffect(() => {
    fetchPaginatedProducts();
  }, [currentPage, pageSize]);

  const fetchPaginatedProducts = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/unistock/user/products`, {
        params: {
          page: currentPage, // 🛠 Truyền số trang hiện tại
          size: pageSize, // 🛠 Truyền số sản phẩm mỗi trang
        }
      });

      console.log("📌 API Response:", response.data);

      // ✅ Kiểm tra dữ liệu trả về từ API
      if (response.data && response.data.content) {
        setProducts(response.data.content);
        setTotalPages(response.data.totalPages || 1); // 🔥 API có totalPages, sử dụng luôn
        setTotalElements(response.data.totalElements || response.data.content.length);
      } else {
        console.warn("⚠️ API không trả về dữ liệu hợp lệ!");
        setProducts([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
      setProducts([]);
      setTotalPages(1);
      setTotalElements(0);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitsData, typesData] = await Promise.all([
          fetchUnits(),
          fetchProductTypes()
        ]);

        console.log("Fetched units:", unitsData);
        console.log("Fetched productTypes:", typesData);

        setUnits(Array.isArray(unitsData) ? unitsData : []); // ✅ Đảm bảo là mảng
        setProductTypes(Array.isArray(typesData) ? typesData : []); // ✅ Đảm bảo là mảng
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn vị và dòng sản phẩm:", error);
        setUnits([]); // ✅ Tránh lỗi
        setProductTypes([]); // ✅ Tránh lỗi
      }
    };
    fetchData();
  }, []);

  const handleOpenMaterialsModal = (product) => {
    setSelectedProductForMaterials(product);
    setShowMaterialsModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateSuccess = () => {
    fetchPaginatedProducts();
  };

  const validateProduct = async (product) => {
    const newErrors = {};

    // Validate mã sản phẩm
    if (!product.productCode) {
      newErrors.productCode = "Mã sản phẩm không được để trống";
    } else {
      // Kiểm tra trùng mã sản phẩm
      try {
        const isCodeExists = await checkProductCodeExists(product.productCode);
        if (isCodeExists) {
          newErrors.productCode = "Mã sản phẩm đã tồn tại";
        }
      } catch (error) {
        newErrors.productCode = "Lỗi kiểm tra mã sản phẩm";
      }
    }

    // Các validation khác giữ nguyên
    if (!product.productName) {
      newErrors.productName = "Tên sản phẩm không được để trống";
    }

    // Validate giá
    if (!product.price || parseFloat(product.price) <= 0) {
      newErrors.price = "Giá sản phẩm phải là số dương";
    }

    // Validate đơn vị
    if (!product.unitId) {
      newErrors.unitId = "Vui lòng chọn đơn vị";
    }

    // Validate dòng sản phẩm
    if (!product.typeId) {
      newErrors.typeId = "Vui lòng chọn dòng sản phẩm";
    }

    // Nếu có lỗi, throw error
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      throw new Error("Validation failed");
    }
  };

  const handleImport = async () => {
    if (!file) {
      alert("Vui lòng chọn file Excel!");
      return;
    }

    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    try {
      setErrors({});

      // Sử dụng await với hàm validate
      await validateProduct(newProduct);

      setLoading(true);
      await createProduct(newProduct);
      alert("Tạo sản phẩm thành công!");
      fetchPaginatedProducts();
      setShowCreatePopup(false);
      setNewProduct({
        productCode: "",
        productName: "",
        description: "",
        unitId: "",
        typeId: "",
        price: "",
        isProductionActive: "true"
      });
    } catch (error) {
      console.error("Chi tiết lỗi:", error);

      // Xử lý các loại lỗi khác nhau
      if (error.response) {
        const errorMessage = error.response.data.message ||
          error.response.data.error ||
          "Lỗi khi tạo sản phẩm! Vui lòng thử lại.";

        alert(errorMessage);
      } else if (error.request) {
        alert("Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối.");
      } else if (error.message === "Validation failed") {
        // Lỗi validate đã được xử lý ở setErrors
      } else {
        alert("Lỗi khi tạo sản phẩm! Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (productId) => {
    if (!productId) {
      alert("❌ Lỗi: Không tìm thấy ID sản phẩm!");
      return;
    }

    try {
      await axios.patch(`http://localhost:8080/api/unistock/user/products/${productId}/toggle-production`);
      fetchPaginatedProducts();
    } catch (error) {
      console.error("❌ Lỗi khi thay đổi trạng thái:", error);
      alert("Lỗi khi thay đổi trạng thái sản xuất!");
    }
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
              Danh sách sản phẩm
            </Typography>
            <div className="flex gap-2">
              <Button
                size="sm"
                color="white"
                variant="text"
                className="flex items-center gap-2"
                onClick={() => setShowCreatePopup(true)}
              >
                <FaPlus className="h-4 w-4" /> Thêm sản phẩm
              </Button>
              <Button
                size="sm"
                color="white"
                variant="text"
                className="flex items-center gap-2"
                onClick={() => setShowImportPopup(true)}
              >
                <FaFileExcel className="h-4 w-4" /> Import Excel
              </Button>
              <Button
                size="sm"
                color="white"
                variant="text"
                className="flex items-center gap-2"
                onClick={exportExcel}
              >
                <FaFileExcel className="h-4 w-4" /> Export Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
          {/* Phần chọn số items/trang */}
          <div className="px-4 py-2 flex items-center gap-2">
            <Typography variant="small" color="blue-gray" className="font-normal">
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
              {[5, 10, 20, 50].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <Typography variant="small" color="blue-gray" className="font-normal">
              sản phẩm mỗi trang
            </Typography>
          </div>

          <table className="w-full min-w-[640px] table-auto">
            <thead>
              <tr>
                {[
                  "STT",
                  "Mã sản phẩm",
                  "Tên sản phẩm",
                  "Mô tả",
                  "Đơn vị",
                  "Dòng sản phẩm",
                  "Giá",
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
              {Array.isArray(products) && products.length > 0 ? (
                products.map((product, index) => {
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
                          {product.description || "N/A"}
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
                        <Typography className="text-xs font-semibold text-blue-gray-600">
                          {product.price?.toLocaleString()} ₫
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
                              onClick={() => handleEdit(product)}
                              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Định mức nguyên vật liệu">
                            <button
                              onClick={() => handleOpenMaterialsModal(product)}
                              className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white"
                            >
                              <FaLayerGroup className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="border-b border-gray-200 px-3 py-4 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Phần phân trang mới sử dụng ReactPaginate */}
          <div className="flex items-center justify-between border-t border-blue-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Typography variant="small" color="blue-gray" className="font-normal">
                Trang {currentPage + 1} / {totalPages} • {totalElements} sản phẩm
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
        </CardBody>
      </Card>

      {/* Các Modal */}
      <BillOfMaterialsModal
        show={showMaterialsModal}
        onClose={() => {
          setShowMaterialsModal(false);
          setSelectedProductForMaterials(null);
        }}
        product={selectedProductForMaterials}
        onUpdate={fetchPaginatedProducts}
      />

      <CreateProductModal
        show={showCreatePopup}
        onClose={() => {
          setShowCreatePopup(false);
          setErrors({});
        }}
        loading={loading}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        handleCreateProduct={handleCreateProduct}
        errors={errors}
        units={units}
        productTypes={productTypes}
      />

      {/* Popup import Excel */}
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
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                color="blue"
                onClick={handleImport}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Import"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <EditProductModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onUpdate={handleUpdateSuccess}
        units={units}
        productTypes={productTypes}
      />
    </div>
  );
};

export default ProductPage;