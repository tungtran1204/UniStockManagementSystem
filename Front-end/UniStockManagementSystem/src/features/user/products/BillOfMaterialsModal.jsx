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

  const fetchMaterials = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/unistock/user/materials');
      setMaterials(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách nguyên vật liệu:", error);
    }
  };

  const fetchProductMaterials = async () => {
    if (!product?.productId) return;
    
    try {
      const response = await axios.get(`http://localhost:8080/api/unistock/user/products/${product.productId}/materials`);
      setProductMaterials(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy định mức nguyên vật liệu:", error);
    }
  };

  const handleAddMaterial = () => {
    if (!selectedMaterial || quantity <= 0) return;

    const materialToAdd = materials.find(m => m.materialId.toString() === selectedMaterial);
    if (!materialToAdd) return;

    // Kiểm tra đã tồn tại
    const existingIndex = productMaterials.findIndex(
      pm => pm.material.materialId.toString() === selectedMaterial
    );

    if (existingIndex !== -1) {
      // Cập nhật số lượng nếu đã tồn tại
      const updatedMaterials = [...productMaterials];
      updatedMaterials[existingIndex].quantity += quantity;
      setProductMaterials(updatedMaterials);
    } else {
      // Thêm mới nếu chưa tồn tại
      setProductMaterials([
        ...productMaterials,
        {
          material: materialToAdd,
          quantity: quantity
        }
      ]);
    }

    // Reset form
    setSelectedMaterial("");
    setQuantity(1);
  };

  const handleRemoveMaterial = (index) => {
    const updatedMaterials = [...productMaterials];
    updatedMaterials.splice(index, 1);
    setProductMaterials(updatedMaterials);
  };

  const handleSave = async () => {
    if (!product?.productId) return;

    setLoading(true);
    try {
      await axios.post(
        `http://localhost:8080/api/unistock/user/products/${product.productId}/materials`,
        productMaterials.map(pm => ({
          materialId: pm.material.materialId,
          quantity: pm.quantity
        }))
      );
      
      alert("Cập nhật định mức nguyên vật liệu thành công!");
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật định mức nguyên vật liệu:", error);
      alert("Lỗi khi cập nhật định mức nguyên vật liệu!");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Định mức nguyên vật liệu - {product?.productName}</Typography>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* Form thêm nguyên vật liệu */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md">
          <Typography variant="small" className="mb-2 font-semibold">Thêm nguyên vật liệu</Typography>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <Select
                label="Chọn nguyên vật liệu"
                value={selectedMaterial}
                onChange={(value) => setSelectedMaterial(value)}
              >
                {materials.map((material) => (
                  <Option key={material.materialId} value={material.materialId.toString()}>
                    {material.materialCode} - {material.materialName}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="col-span-3">
              <Input
                type="number"
                label="Số lượng"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="col-span-3 flex items-end">
              <Button
                color="green"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleAddMaterial}
              >
                <FaPlus className="h-3 w-3" /> Thêm
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
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {productMaterials.length > 0 ? (
                productMaterials.map((item, index) => (
                  <tr key={index} className="even:bg-blue-gray-50/50">
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {index + 1}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {item.material.materialCode}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {item.material.materialName}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Typography variant="small" color="blue-gray" className="font-normal">
                        {item.material.unitName}
                      </Typography>
                    </td>
                    <td className="p-4">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const updatedMaterials = [...productMaterials];
                          updatedMaterials[index].quantity = Number(e.target.value);
                          setProductMaterials(updatedMaterials);
                        }}
                        min="0.01"
                        step="0.01"
                        className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                      />
                    </td>
                    <td className="p-4">
                      <Button
                        color="red"
                        variant="text"
                        size="sm"
                        onClick={() => handleRemoveMaterial(index)}
                        className="flex items-center gap-2"
                      >
                        <FaTrash className="h-3 w-3" /> Xóa
                      </Button>
                    </td>
                  </tr>
                ))
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
          <Button color="gray" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button color="blue" onClick={handleSave} disabled={loading}>
            {loading ? "Đang xử lý..." : "Lưu định mức"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BillOfMaterialsModal;