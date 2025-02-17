import React, { useEffect, useState } from "react";
import useProduct from "./useProduct";
import { deleteProduct, importExcel, exportExcel } from "./productService";
import { useNavigate } from "react-router-dom";

const ProductPage = () => {
  const { products, fetchProducts } = useProduct();
  const navigate = useNavigate();
  const [showImportPopup, setShowImportPopup] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
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

  // ✅ Xử lý import file Excel
  const handleImport = async () => {
    if (!file) {
      alert("📛 Vui lòng chọn file Excel!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file); // ✅ Đảm bảo gửi đúng key "file"

    setLoading(true);
    try {
      await importExcel(file);
      alert("✅ Import thành công!");
      fetchProducts(); // Cập nhật danh sách sản phẩm
      setShowImportPopup(false);
      setFile(null);
    } catch (error) {
      console.error("❌ Lỗi khi import file:", error);
      alert("Lỗi import file! Kiểm tra lại dữ liệu.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">Quản lý Sản phẩm</h2>

      {/* Button Thêm sản phẩm, Import & Export Excel */}
      <div className="flex gap-4">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          onClick={() => navigate("/products/create")}>
          ➕ Thêm sản phẩm
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition"
          onClick={() => setShowImportPopup(true)}>
          📥 Import Excel
        </button>
        <button className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition"
          onClick={exportExcel}>
          📤 Export Excel
        </button>
      </div>

      {/* Bảng sản phẩm */}
      <div className="mt-4 overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="py-2 px-4 border">STT</th>
              <th className="py-2 px-4 border">Tên sản phẩm</th>
              <th className="py-2 px-4 border">Mô tả</th>
              <th className="py-2 px-4 border">Đơn vị</th>
              <th className="py-2 px-4 border">Loại sản phẩm</th>
              <th className="py-2 px-4 border">Giá</th>
              <th className="py-2 px-4 border">Tạo bởi</th>
              <th className="py-2 px-4 border">Cập nhật bởi</th>
              <th className="py-2 px-4 border">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product, index) => (
                <tr key={product.productId} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border text-center">{index + 1}</td>
                  <td className="py-2 px-4 border">{product.productName}</td>
                  <td className="py-2 px-4 border">{product.description}</td>
                  <td className="py-2 px-4 border">{product.unitName || "N/A"}</td>
                  <td className="py-2 px-4 border">{product.typeName || "N/A"}</td>
                  <td className="py-2 px-4 border text-right">{product.price.toLocaleString()} ₫</td>
                  <td className="py-2 px-4 border">{product.createdBy || "Không rõ"}</td>
                  <td className="py-2 px-4 border">{product.updatedBy || "Không rõ"}</td>
                  <td className="py-2 px-4 border flex justify-center gap-2">
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 transition"
                      onClick={() => navigate(`/products/edit/${product.productId}`)}>✏ Sửa
                    </button>
                    <button className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 transition"
                      onClick={() => handleDelete(product.productId)}>❌ Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center py-4 text-gray-500">
                  Không có sản phẩm nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Popup Import Excel */}
      {showImportPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold">📥 Import File Excel</h2>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              className="mt-2 border p-2 w-full"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 bg-gray-400 text-white rounded" onClick={() => setShowImportPopup(false)}>❌ Đóng</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleImport} disabled={loading}>
                {loading ? "⏳ Đang Import..." : "📤 Import"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
