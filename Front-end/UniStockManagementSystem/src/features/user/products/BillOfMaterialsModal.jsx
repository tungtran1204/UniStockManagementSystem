import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Typography,
} from "@material-tailwind/react";
import { FaPlus, FaTrash, FaTimes } from "react-icons/fa";
import axios from "axios";

// Hàm lấy token từ LocalStorage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Chuẩn hóa chuỗi (loại bỏ khoảng trắng thừa, xử lý dấu gạch nối, ký tự đặc biệt)
const normalizeString = (str) =>
  str
    ?.toLowerCase()
    .trim()
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\w\sÀ-ỹ]/g, "")
    || "";

const BillOfMaterialsModal = ({ show, onClose, product, onUpdate }) => {
  const [materials, setMaterials] = useState([]);
  const [productMaterials, setProductMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tableSearchQuery, setTableSearchQuery] = useState("");

  useEffect(() => {
    if (show && product) {
      fetchMaterials();
      fetchProductMaterials();
    }
  }, [show, product]);

  // Lấy danh sách nguyên vật liệu
  const fetchMaterials = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/materials`, {
        headers: authHeader(),
      });

      console.log("📌 API Materials Response:", response.data);
      if (response.data && Array.isArray(response.data.content)) {
        setMaterials(response.data.content);
      } else {
        setMaterials([]);
        console.warn("⚠️ Dữ liệu từ API không phải là mảng hoặc không có content!");
      }
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách nguyên vật liệu:", error);
      setMaterials([]);
    }
  };

  // Lấy danh sách nguyên vật liệu của sản phẩm
  const fetchProductMaterials = async () => {
    if (!product?.productId) return;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/product-materials/${product.productId}`,
        { headers: authHeader() }
      );

      console.log("📌 API Product Materials Response:", response.data);
      if (Array.isArray(response.data)) {
        const updatedMaterials = response.data.map((pm) => {
          const materialData = materials.find((m) => m.materialId === pm.materialId);
          return {
            ...pm,
            material: materialData || pm.material,
          };
        });
        console.log("📌 Updated Product Materials:", updatedMaterials);
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

  // Lọc vật tư theo từ khóa tìm kiếm
  useEffect(() => {
    console.log("🔍 Search Query:", searchQuery);
    console.log("🔍 Materials:", materials);

    if (searchQuery.trim() === "") {
      setFilteredMaterials([]);
      setShowSuggestions(false);
    } else {
      const filtered = materials.filter((material) => {
        const materialCode = material.materialCode || "";
        const materialName = material.materialName || "";
        const searchLower = normalizeString(searchQuery);

        const codeMatch = normalizeString(materialCode).includes(searchLower);
        const nameMatch = normalizeString(materialName).includes(searchLower);

        console.log(
          `🔍 Filtering: Code=${materialCode}, Name=${materialName}, Search=${searchLower}, CodeMatch=${codeMatch}, NameMatch=${nameMatch}`
        );
        return codeMatch || nameMatch;
      });

      setFilteredMaterials(filtered);
      setShowSuggestions(filtered.length > 0);
      console.log("🔍 Filtered Materials:", filtered);
    }
  }, [searchQuery, materials]);

  // Lọc danh sách trong bảng
  const filteredTableMaterials = productMaterials.filter((item) => {
    const material = item?.material || {};
    const searchLower = normalizeString(tableSearchQuery);
    const materialCode = material.materialCode || "";
    const materialName = material.materialName || "";

    const codeMatch = normalizeString(materialCode).includes(searchLower);
    const nameMatch = normalizeString(materialName).includes(searchLower);

    console.log(
      `🔍 Table Search: Query=${tableSearchQuery}, MaterialCode=${materialCode}, MaterialName=${materialName}, CodeMatch=${codeMatch}, NameMatch=${nameMatch}`
    );
    return codeMatch || nameMatch;
  });

  // Xóa từ khóa tìm kiếm
  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedMaterial("");
    setShowSuggestions(false);
  };

  // Thêm nguyên vật liệu
  const handleAddMaterial = () => {
    if (!selectedMaterial || quantity <= 0) return;

    const materialToAdd = materials.find((m) => m.materialId.toString() === selectedMaterial);
    if (!materialToAdd) return;

    setProductMaterials((prevMaterials) => {
      const existingIndex = prevMaterials.findIndex(
        (pm) => pm.material?.materialId.toString() === selectedMaterial
      );

      if (existingIndex !== -1) {
        const updatedMaterials = [...prevMaterials];
        updatedMaterials[existingIndex].quantity = quantity;
        return updatedMaterials;
      } else {
        return [...prevMaterials, { material: materialToAdd, quantity }];
      }
    });

    setSelectedMaterial("");
    setSearchQuery(""); // Reset thanh tìm kiếm sau khi thêm
    setQuantity(1);
    setShowSuggestions(false);
  };

  // Xóa nguyên vật liệu khỏi danh sách tạm
  const handleRemoveMaterial = (index) => {
    setProductMaterials((prevMaterials) => prevMaterials.filter((_, i) => i !== index));
  };

  // Xóa nguyên vật liệu từ server
  const handleDeleteMaterial = async (materialId) => {
    if (!product?.productId) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/user/product-materials/${product.productId}/materials/${materialId}`,
        { headers: authHeader() }
      );
      fetchProductMaterials();
    } catch (error) {
      console.error("❌ Lỗi khi xóa vật tư:", error);
      alert("❌ Không thể xóa vật tư!");
    }
  };

  // Lưu danh sách nguyên vật liệu
  const handleSave = async () => {
    if (!product?.productId) return;

    console.log("📌 Danh sách vật tư gửi lên:", productMaterials);
    setLoading(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/user/product-materials/${product.productId}/materials`,
        productMaterials.map((pm) => ({
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

  if (!show) return null;

  return (
    <Dialog open={show} handler={onClose} size="xl" className="w-[900px] max-h-screen overflow-auto">
      <DialogHeader className="bg-gray-50">
        <Typography variant="h5" color="blue-gray" className="px-5">
          Định mức nguyên vật liệu - {product?.productName}
        </Typography>
      </DialogHeader>

      <DialogBody divider className="flex flex-col gap-4 px-10 border-none">
        {/* Form thêm nguyên vật liệu */}
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3 relative">
            <Typography variant="small" className="mb-2 text-gray-900 font-bold">
              Tìm kiếm nguyên vật liệu
            </Typography>
            <Input
              label="Nhập mã hoặc tên nguyên vật liệu"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
            {showSuggestions && filteredMaterials.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                {filteredMaterials.map((material) => (
                  <li
                    key={material.materialId}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      setSelectedMaterial(material.materialId.toString());
                      setSearchQuery(`${material.materialCode} - ${material.materialName}`);
                      setShowSuggestions(false);
                    }}
                  >
                    {material.materialCode} - {material.materialName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <Typography variant="small" className="mb-2 text-gray-900 font-bold">
              Số lượng
            </Typography>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              min="1"
              step="1"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Button variant="outlined" onClick={handleAddMaterial}>
            + Thêm nguyên vật liệu
          </Button>
        </div>

        {/* Trước bảng nguyên vật liệu, thêm ô tìm kiếm */}
        <div className="flex items-center gap-4 mb-4">
          <Typography variant="small" className="text-gray-900 font-bold">
            Danh sách nguyên vật liệu
          </Typography>
          <div className="flex-1">
            <Input
              label="Tìm kiếm trong danh sách"
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              className="w-full"
              icon={
                tableSearchQuery && (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setTableSearchQuery("")}
                  >
                    <FaTimes className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </button>
                )
              }
            />
          </div>
        </div>

        {/* Bảng nguyên vật liệu */}
        <div className="mt-2 overflow-auto border-none rounded">
          <table className="w-full text-left min-w-max border border-gray-200">
            <thead className="bg-gray-50 border border-gray-200">
              <tr>
                {["STT", "Mã NVL", "Tên NVL", "Đơn vị", "Số lượng", "Thao tác"].map((head) => (
                  <th
                    key={head}
                    className="px-4 py-2 text-sm border border-gray-200 font-semibold text-gray-600"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTableMaterials.length > 0 ? (
                filteredTableMaterials.map((item, index) => {
                  const material = item?.material || {};
                  return (
                    <tr key={index} className="border border-gray-200">
                      <td className="px-4 py-2 text-sm text-gray-700">{index + 1}</td>
                      <td className="px-4 py-2 text-sm">{material.materialCode || "N/A"}</td>
                      <td className="px-4 py-2 text-sm">{material.materialName || "N/A"}</td>
                      <td className="px-4 py-2 text-sm">{material.unitName || "N/A"}</td>
                      <td className="px-4 py-2 text-sm">
                        <Input
                          variant="standard"
                          type="number"
                          className="w-16"
                          value={item.quantity || 0}
                          onChange={(e) => {
                            const updatedMaterials = [...productMaterials];
                            updatedMaterials[index].quantity = Number(e.target.value);
                            setProductMaterials(updatedMaterials);
                          }}
                        />
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <Button
                          variant="text"
                          color="red"
                          size="sm"
                          onClick={() => handleDeleteMaterial(material.materialId)}
                        >
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center text-gray-500">
                    {productMaterials.length === 0
                      ? "Chưa có nguyên vật liệu nào được thêm"
                      : "Không tìm thấy kết quả phù hợp"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-end gap-2">
        <Button variant="text" color="gray" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="gradient" color="green" onClick={handleSave} disabled={loading}>
          {loading ? "Đang xử lý..." : "Lưu"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default BillOfMaterialsModal;