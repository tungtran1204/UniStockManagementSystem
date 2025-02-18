import React, { useEffect, useState } from "react";
import useProduct from "./useProduct";
import {
  deleteProduct,
  importExcel,
  exportExcel,
  createProduct,
  fetchUnits,
  fetchProductTypes
} from "./productService";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Tooltip,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { FaEdit, FaTrashAlt, FaFileExcel, FaPlus } from "react-icons/fa";

const ProductPage = () => {
  const { products, fetchProducts } = useProduct();
  const navigate = useNavigate();
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  // State cho form tạo sản phẩm mới
  const [newProduct, setNewProduct] = useState({
    productCode: "",
    productName: "",
    description: "",
    unitId: "",
    unitName: "",
    typeId: "",
    typeName: "",
    price: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [unitsData, typesData] = await Promise.all([
          fetchUnits(),
          fetchProductTypes()
        ]);
        console.log("Units Data:", unitsData); // Log dữ liệu đơn vị
        setUnits(unitsData);
        setProductTypes(typesData);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn vị và dòng sản phẩm:", error);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (error) {
        console.error("❌ Lỗi khi xóa sản phẩm:", error);
      }
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
      fetchProducts();
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
    if (!newProduct.productCode || !newProduct.productName || !newProduct.price) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      await createProduct(newProduct);
      alert("Tạo sản phẩm thành công!");
      fetchProducts();
      setShowCreatePopup(false);
      setNewProduct({
        productCode: "",
        productName: "",
        description: "",
        unitName: "",
        typeName: "",
        price: "",
      });
    } catch (error) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      alert("Lỗi khi tạo sản phẩm! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
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
                  "Hành động",
                ].map((el) => (
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
              {products.length > 0 ? (
                products.map((product, index) => {
                  const className = `py-3 px-5 ${index === products.length - 1
                    ? ""
                    : "border-b border-blue-gray-50"
                    }`;

                  return (
                    <tr key={product.productId}>
                      <td className={className}>
                        <Typography
                          variant="small"
                          color="blue-gray"
                          className="font-semibold"
                        >
                          {index + 1}
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
                          {product.description}
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
                          {product.price.toLocaleString()} ₫
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex items-center gap-2">
                          <Tooltip content="Chỉnh sửa">
                            <button
                              onClick={() =>
                                navigate(`/products/edit/${product.productId}`)
                              }
                              className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                              <FaEdit className="h-4 w-4" />
                            </button>
                          </Tooltip>
                          <Tooltip content="Xóa sản phẩm">
                            <button
                              onClick={() => handleDelete(product.productId)}
                              className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white"
                            >
                              <FaTrashAlt className="h-4 w-4" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="border-b border-gray-200 px-3 py-4 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* Popup tạo sản phẩm mới */}
      {showCreatePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="h6">Tạo sản phẩm mới</Typography>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowCreatePopup(false)}
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Typography variant="small" className="mb-2">Mã sản phẩm *</Typography>
                <Input
                  type="text"
                  value={newProduct.productCode}
                  onChange={(e) => setNewProduct({ ...newProduct, productCode: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <Typography variant="small" className="mb-2">Tên sản phẩm *</Typography>
                <Input
                  type="text"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                  className="w-full"
                />
              </div>
              <div>
                <Typography variant="small" className="mb-2">Đơn vị</Typography>
                <Select
                  value={newProduct.unitId}
                  onChange={(value) => setNewProduct({
                    ...newProduct,
                    unitId: value,
                    unitName: units.find(unit => unit.unitId === value)?.unitName || ''
                  })}
                  className="w-full"
                  label="Chọn đơn vị"
                >
                  {units && units.length > 0 ? (
                    units.map((unit) => (
                      <Option key={unit.unitId} value={unit.unitId}>
                        {unit.unitName}
                      </Option>
                    ))
                  ) : (
                    <Option disabled>Không có dữ liệu</Option>
                  )}
                </Select>
              </div>
              <div>
                <Typography variant="small" className="mb-2">Dòng sản phẩm</Typography>
                <Select
                  value={newProduct.typeId}
                  onChange={(value) => setNewProduct({
                    ...newProduct,
                    typeId: value,
                    typeName: productTypes.find(type => type.typeId === value)?.typeName || ''
                  })}
                  className="w-full"
                  label="Chọn dòng sản phẩm"
                >
                  {productTypes && productTypes.length > 0 ? (
                    productTypes.map((type) => (
                      <Option key={type.typeId} value={type.typeId}>
                        {type.typeName}
                      </Option>
                    ))
                  ) : (
                    <Option disabled>Không có dữ liệu</Option>
                  )}
                </Select>
              </div>
              <div>
                <Typography variant="small" className="mb-2">Giá *</Typography>
                <Input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="col-span-2">
                <Typography variant="small" className="mb-2">Mô tả</Typography>
                <Input
                  type="text"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                color="gray"
                onClick={() => setShowCreatePopup(false)}
                disabled={loading}
              >
                Hủy
              </Button>
              <Button
                color="blue"
                onClick={handleCreateProduct}
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Tạo sản phẩm"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
};

export default ProductPage;