import React, { useState, useEffect } from "react";
import { Typography, Button, Input } from "@material-tailwind/react";
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
      const response = await axios.get("http://localhost:8080/api/unistock/user/materials", {
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
        `http://localhost:8080/api/unistock/user/product-materials/${product.productId}`,
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
        `http://localhost:8080/api/unistock/user/product-materials/${product.productId}/materials/${materialId}`,
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
        `http://localhost:8080/api/unistock/user/product-materials/${product.productId}/materials`,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6">Định mức nguyên vật liệu - {product?.productName}</Typography>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Form thêm nguyên vật liệu */}
        <div className="mb-6 p-4 border border-gray-200 rounded-md">
          <Typography variant="small" className="mb-2 font-semibold">
            Thêm nguyên vật liệu
          </Typography>
          <div className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-5 relative">
              <div className="flex items-center">
                <Input
                  label="Tìm kiếm nguyên vật liệu"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-3 px-5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none transition duration-200"
                />
                {searchQuery && (
                  <button
                    className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                    onClick={handleClearSearch}
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                )}
              </div>
              {showSuggestions && filteredMaterials.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                  {filteredMaterials.map((material) => (
                    <li
                      key={material.materialId}
                      className="p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedMaterial(material.materialId.toString());
                        setSearchQuery(`${material.materialCode} - ${material.materialName}`); // Hiển thị vật tư đã chọn trong thanh tìm kiếm
                        setShowSuggestions(false);
                      }}
                    >
                      {material.materialCode} - {material.materialName}
                    </li>
                  ))}
                </ul>
              )}
              {showSuggestions && searchQuery && filteredMaterials.length === 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 p-2 text-gray-500">
                  Không tìm thấy vật tư
                </div>
              )}
            </div>
            <div className="col-span-5">
              <Input
                type="number"
                label="Số lượng"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                step="1"
                className="w-full py-3 px-5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none transition duration-200"
              />
            </div>
            <div className="col-span-2">
              <Button
                color="green"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleAddMaterial}
              >
                <FaPlus className="h-4 w-4" /> Thêm
              </Button>
            </div>
          </div>
        </div>

        {/* Danh sách nguyên vật liệu */}
        <div className="mb-4">
          <Typography variant="small" className="mb-2 font-semibold">
            Danh sách nguyên vật liệu
          </Typography>

          {/* Thêm thanh tìm kiếm */}
          <div className="mb-4 relative">
            <Input
              label="Tìm kiếm trong danh sách"
              value={tableSearchQuery}
              onChange={(e) => setTableSearchQuery(e.target.value)}
              className="w-full py-3 px-5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none transition duration-200"
            />
            {tableSearchQuery && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setTableSearchQuery("")}
              >
                <FaTimes className="h-4 w-4" />
              </button>
            )}
          </div>
          <table className="w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {["STT", "Mã NVL", "Tên NVL", "Đơn vị", "Số lượng", "Thao tác"].map((head) => (
                  <th
                    key={head}
                    className="border-b border-blue-gray-100 bg-blue-gray-50 p-4"
                  >
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
              {filteredTableMaterials.length > 0 ? (
                filteredTableMaterials.map((item, index) => {
                  const material = item?.material || {};
                  return (
                    <tr key={index} className="bg-white"> {/* Xóa even:bg-blue-gray-50/50, giữ bg-white */}
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
                          className="w-full py-3 px-5 text-gray-700 border border-gray-300 rounded-lg shadow-sm focus:outline-none transition duration-200"
                        />
                      </td>
                      <td className="p-4">
                        <Button
                          color="red"
                          variant="text"
                          size="sm"
                          onClick={() => handleDeleteMaterial(material.materialId)}
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
                    {productMaterials.length === 0
                      ? "Chưa có nguyên vật liệu nào được thêm"
                      : "Không tìm thấy kết quả phù hợp"}
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