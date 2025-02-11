import React, { useEffect } from "react";
import useProduct from "./useProduct";
import { deleteProduct } from "./productService";
import { useNavigate } from "react-router-dom";

const ProductPage = () => {
  const { products, fetchProducts } = useProduct();
  const navigate = useNavigate();
  const userId = 1; // 🔥 Tạm thời fix cứng userId, sau này lấy từ context

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      await deleteProduct(userId, productId);
      fetchProducts(); // Cập nhật lại danh sách sản phẩm sau khi xóa
    }
  };

  return (
    <div className="container mt-4">
      <h2>Quản lý Sản phẩm</h2>
      <button className="btn btn-primary mb-3" onClick={() => navigate("/products/new")}>
        ➕ Thêm sản phẩm
      </button>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên sản phẩm</th>
            <th>Mô tả</th>
            <th>Giá</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((product) => (
              <tr key={product.productId}>
                <td>{product.productId}</td>
                <td>{product.productName}</td>
                <td>{product.description}</td>
                <td>{product.price}</td>
                <td>
                  <button className="btn btn-sm btn-warning" onClick={() => navigate(`/products/edit/${product.productId}`)}>
                    ✏ Sửa
                  </button>
                  <button className="btn btn-sm btn-danger ms-2" onClick={() => handleDelete(product.productId)}>
                    ❌ Xóa
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">Không có sản phẩm nào</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductPage