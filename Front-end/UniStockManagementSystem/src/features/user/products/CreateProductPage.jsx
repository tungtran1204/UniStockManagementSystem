import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct, getAllUnits, getAllProductTypes } from "./productService";

const CreateProductPage = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    productName: "",
    description: "",
    price: "",
    unitId: "",
    typeId: "",
    createdBy: "",  // ✅ Người dùng nhập vào
  });

  const [units, setUnits] = useState([]);
  const [productTypes, setProductTypes] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const unitData = await getAllUnits();
        const productTypeData = await getAllProductTypes();
        setUnits(unitData);
        setProductTypes(productTypeData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const formattedProduct = {
      ...product,
      price: parseFloat(product.price),    
      unitId: parseInt(product.unitId, 10),
      typeId: parseInt(product.typeId, 10), 
    };
  
  
    try {
      await createProduct(formattedProduct);
      alert("Sản phẩm đã được thêm thành công!");
      navigate("/products");
    } catch (error) {
      console.error("❌ Lỗi khi tạo sản phẩm:", error);
      console.error("🔥 Chi tiết lỗi Axios:", error.response?.data);
      alert("Đã có lỗi xảy ra, vui lòng thử lại.");
    }
  };
  
  
  return (
    <div className="max-w-lg mx-auto mt-6 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Thêm sản phẩm mới</h2>
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

        {/* ✅ Trường nhập tên người tạo */}
        <input
          type="text"
          name="createdBy"
          value={product.createdBy}
          onChange={handleChange}
          placeholder="Tên người tạo"
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
          name="typeId"  // ✅ Đổi từ productTypeId → typeId
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
        >
          Thêm sản phẩm
        </button>
      </form>
    </div>
  );
};

export default CreateProductPage;
