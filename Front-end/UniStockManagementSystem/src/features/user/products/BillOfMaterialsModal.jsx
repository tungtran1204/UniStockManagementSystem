import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Input,
  Select,
  Option,
} from "@material-tailwind/react";
import { FaPlus, FaTrash } from "react-icons/fa";
import axios from 'axios';

// Hàm lấy token từ LocalStorage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const BillOfMaterialsModal = ({ show, onClose, product, onUpdate }) => {
  const [materials, setMaterials] = useState([]);
  const [productMaterials, setProductMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && product) {
      fetchMaterials();
      fetchProductMaterials();
    }
  }, [show, product]);

  // Lấy danh sách nguyên vật liệu
  const fetchMaterials = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/unistock/user/materials', {
        headers: authHeader(),
      });

      console.log("📌 API Materials Response:", response.data); // Debug API Response

      if (response.data && Array.isArray(response.data.content)) {
        setMaterials(response.data.content); // Lấy dữ liệu từ content
      } else {
        setMaterials([]); // Nếu API không trả về mảng, đặt về []
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách nguyên vật liệu:", error);
      setMaterials([]); // Nếu lỗi, đặt về []
    }
  };



  // Lấy danh sách nguyên vật liệu của sản phẩm
  const fetchProductMaterials = async () => {
    if (!product?.productId) return;

    try {
      const response = await axios.get(
        `http://localhost:8080/api/unistock/user/product-materials/${product.productId}`,
        { headers: authHeader() }
      );

      console.log("📌 API Product Materials Response:", response.data);

      if (Array.isArray(response.data)) {
        // 🔥 Kiểm tra nếu `material` bị thiếu, tự động thêm thông tin từ `materials` list
        const updatedMaterials = response.data.map(pm => {
          const materialData = materials.find(m => m.materialId === pm.materialId);
          return {
            ...pm,
            material: materialData || pm.material, // Cập nhật dữ liệu từ danh sách materials
          };
        });

        setProductMaterials(updatedMaterials);
      } else {
        console.error("⚠️ API Product Materials không hợp lệ!");
        setProductMaterials([]);
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy định mức nguyên vật liệu:", error);
      setProductMaterials([]);
    }
  };




  // Thêm nguyên vật liệu vào danh sách, nếu trùng thì cộng dồn số lượng
  const handleAddMaterial = () => {
    if (!selectedMaterial || quantity <= 0) return;

    const materialToAdd = materials.find(m => m.materialId.toString() === selectedMaterial);
    if (!materialToAdd) return;

    setProductMaterials(prevMaterials => {
      const existingIndex = prevMaterials.findIndex(pm => pm.material?.materialId.toString() === selectedMaterial);

      if (existingIndex !== -1) {
        // Nếu nguyên vật liệu đã tồn tại, cập nhật số lượng
        const updatedMaterials = [...prevMaterials];
        updatedMaterials[existingIndex].quantity = quantity; // ⚠️ Ghi đè số lượng thay vì cộng dồn
        return updatedMaterials;
      } else {
        // Nếu chưa có, thêm mới
        return [...prevMaterials, { material: materialToAdd, quantity }];
      }
    });

    setSelectedMaterial("");
    setQuantity(1);
  };

  // Xóa nguyên vật liệu khỏi danh sách
  const handleRemoveMaterial = (index) => {
    setProductMaterials(prevMaterials => prevMaterials.filter((_, i) => i !== index));
  };

  // Lưu danh sách nguyên vật liệu vào sản phẩm
  const handleSave = async () => {
    if (!product?.productId) return;

    console.log("📌 Danh sách vật tư gửi lên:", productMaterials); // ✅ Kiểm tra danh sách trước khi gửi API

    setLoading(true);
    try {
      await axios.post(
        `http://localhost:8080/api/unistock/user/product-materials/${product.productId}/materials`,
        productMaterials.map(pm => ({
          materialId: pm.material?.materialId,
          quantity: pm.quantity,
        })),
        { headers: authHeader() }
      );

      alert("✅ Cập nhật định mức nguyên vật liệu thành công!");

      setTimeout(fetchProductMaterials, 500);
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error("❌ Lỗi khi cập nhật định mức nguyên vật liệu:", error);
      alert("❌ Lỗi khi cập nhật định mức nguyên vật liệu!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId) => {
    if (!product?.productId) return;

    try {
      await axios.delete(`http://localhost:8080/api/unistock/user/product-materials/${product.productId}/materials/${materialId}`, {
        headers: authHeader(),
      });


      // Cập nhật danh sách sau khi xóa
      fetchProductMaterials();
    } catch (error) {
      console.error("❌ Lỗi khi xóa vật tư:", error);
      alert("❌ Không thể xóa vật tư!");
    }
  };




  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Định mức nguyên vật liệu - {product?.productName}</Typography>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Form thêm nguyên vật liệu */}
        {/* Form thêm nguyên vật liệu */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md">
          <Typography variant="small" className="mb-2 font-semibold">Thêm nguyên vật liệu</Typography>
          <div className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-5">
              <Select
                label="Chọn nguyên vật liệu"
                value={selectedMaterial}
                onChange={(value) => setSelectedMaterial(value)}
              >
                {Array.isArray(materials) && materials.length > 0 ? (
                  materials.map((material) => (
                    <Option key={material.materialId} value={material.materialId.toString()}>
                      {material.materialCode} - {material.materialName}
                    </Option>
                  ))
                ) : (
                  <Option disabled>Không có dữ liệu</Option>
                )}
              </Select>
            </div>
            <div className="col-span-5">
              <Input
                type="number"
                label="Số lượng"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                step="1"
              />
            </div>
            <div className="col-span-2">
              <Button color="green" className="w-full flex items-center justify-center gap-2" onClick={handleAddMaterial}>
                <FaPlus className="h-4 w-4" /> Thêm
              </Button>
            </div>
          </div>
        </div>

        {/* Danh sách nguyên vật liệu */}
        <div className="mb-4">
          <Typography variant="small" className="mb-2 font-semibold">Danh sách nguyên vật liệu</Typography>
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {["STT", "Mã NVL", "Tên NVL", "Đơn vị", "Số lượng", "Thao tác"].map((head) => (
                  <th key={head} className="border-b border-blue-gray-100 bg-blue-gray-50 p-4">
                    <Typography variant="small" color="blue-gray" className="font-normal leading-none opacity-70">
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productMaterials.length > 0 ? (
                productMaterials.map((item, index) => {
                  const material = item?.material || {}; // 🛠 Kiểm tra nếu `material` bị `undefined`
                  return (
                    <tr key={index} className="even:bg-blue-gray-50/50">
                      <td className="p-4">{index + 1}</td>
                      <td className="p-4">{material.materialCode || "N/A"}</td>
                      <td className="p-4">{material.materialName || "N/A"}</td>
                      <td className="p-4">{material.unitName || "N/A"}</td>
                      <td className="p-4">
                        <Input
                          type="number"
                          value={item.quantity || 0}
                          onChange={(e) => {
                            const updatedMaterials = [...productMaterials];
                            updatedMaterials[index].quantity = Number(e.target.value);
                            setProductMaterials(updatedMaterials);
                          }}
                          min="1"
                          step="1"
                          className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                        />
                      </td>
                      <td className="p-4">
                        <Button
                          color="red"
                          variant="text"
                          size="sm"
                          onClick={() => handleDeleteMaterial(item.material.materialId)}
                          className="flex items-center gap-2"
                        >
                          <FaTrash className="h-3 w-3" /> Xóa
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="p-4 text-center text-gray-500">
                    Chưa có nguyên vật liệu nào được thêm
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button color="gray" onClick={onClose} disabled={loading}>Hủy</Button>
          <Button color="blue" onClick={handleSave} disabled={loading}>{loading ? "Đang xử lý..." : "Lưu định mức"}</Button>
        </div>
      </div>
    </div>
  );
};

export default BillOfMaterialsModal;
