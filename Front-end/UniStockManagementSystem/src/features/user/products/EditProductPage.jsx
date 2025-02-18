import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById, updateProduct } from "./productService";
import { getAllUnits, getAllProductTypes } from "./productService";

const EditProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    productName: "",
    description: "",
    price: "",
    unitId: "",
    typeId: "",
    updatedBy: "",
  });

  const [units, setUnits] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Load danh sách đơn vị và loại sản phẩm
  useEffect(() => {
    async function fetchData() {
      try {
        const unitData = await getAllUnits();
        const productTypeData = await getAllProductTypes();
        setUnits(unitData);
        setProductTypes(productTypeData);

        // ✅ Lấy thông tin sản phẩm hiện tại
        const productData = await getProductById(productId);
        setProduct({
          ...productData,
          price: productData.price.toString(), 
        });
      } catch (error) {
        console.error("❌ Lỗi khi tải dữ liệu sản phẩm:", error);
      }
    }
    fetchData();
  }, [productId]);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProduct(productId, product);
      alert("✅ Cập nhật sản phẩm thành công!");
      navigate("/products");
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật sản phẩm:", error);
      alert("Lỗi khi cập nhật sản phẩm! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-6 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">✏ Chỉnh sửa sản phẩm</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="productName"
          value={product.productName}
          onChange={handleChange}
          placeholder="Tên sản phẩm"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <textarea
          name="description"
          value={product.description}
          onChange={handleChange}
          placeholder="Mô tả sản phẩm"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="number"
          name="price"
          value={product.price}
          onChange={handleChange}
          placeholder="Giá sản phẩm"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="text"
          name="updatedBy"
          value={product.updatedBy}
          onChange={handleChange}
          placeholder="Tên người cập nhật"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <select
          name="unitId"
          value={product.unitId}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="">Chọn đơn vị</option>
          {units.map((unit) => (
            <option key={unit.unitId} value={unit.unitId}>
              {unit.unitName}
            </option>
          ))}
        </select>
        <select
          name="typeId"
          value={product.typeId}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="">Chọn loại sản phẩm</option>
          {productTypes.map((type) => (
            <option key={type.typeId} value={type.typeId}>
              {type.typeName}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          disabled={loading}
        >
          {loading ? "⏳ Đang cập nhật..." : "💾 Cập nhật sản phẩm"}
        </button>
      </form>
    </div>
  );
};

export default EditProductPage;
