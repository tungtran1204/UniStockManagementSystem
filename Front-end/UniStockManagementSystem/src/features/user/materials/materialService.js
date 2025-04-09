import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const API_URL = `${import.meta.env.VITE_API_URL}/user/materials`;

// Hàm để lấy Token từ LocalStorage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};


// Lấy danh sách nguyên vật liệu phân trang
export const getAllMaterials = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(API_URL, {
      headers: authHeader(),
      params: {
        page: page,
        size: size
      }
    });

    console.log("📌 [getAllMaterials] API Response:", response.data);

    if (response.data && response.data.content) {
      const categories = await fetchMaterialCategories(); // Lấy danh mục để ánh xạ
      return {
        materials: response.data.content.map(material => {
          let typeName = material.typeName || "Không có danh mục";
          if (material.typeId) {
            const category = categories.find(cat => cat.materialTypeId === material.typeId);
            typeName = category ? category.name : typeName;
          }
          return {
            ...material,
            typeName: typeName
          };
        }),
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || response.data.content.length
      };
    } else {
      console.warn("⚠️ API không trả về dữ liệu hợp lệ!");
      return {
        materials: [],
        totalPages: 1,
        totalElements: 0
      };
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách nguyên vật liệu:", error);
    throw error;
  }
};

// Lấy nguyên vật liệu theo ID
export const getMaterialById = async (materialId) => {
  try {
    const response = await axios.get(`${API_URL}/${materialId}`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Lỗi khi lấy nguyên vật liệu có ID ${materialId}:`, error);
    throw error;
  }
};

// Tạo nguyên vật liệu mới
export const createMaterial = async (formData) => {
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/user/materials/create`,
      formData,
      {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ [createMaterial] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo nguyên vật liệu:", error.response?.data || error.message);
    throw error;
  }
};

// Cập nhật nguyên vật liệu
const handleUpdateMaterial = async () => {
  if (!editedMaterial.materialId) {
    alert("❌ Không tìm thấy ID nguyên vật liệu!");
    return;
  }

  try {
    setLoading(true);

    const formData = new FormData();
    formData.append("materialCode", editedMaterial.materialCode);
    formData.append("materialName", editedMaterial.materialName);
    formData.append("description", editedMaterial.description || "");
    formData.append("unitId", editedMaterial.unitId || "");
    formData.append("typeId", editedMaterial.materialTypeId || ""); // ✅ Đổi `materialTypeId` thành `typeId`

    if (editedMaterial.image) {
      formData.append("image", editedMaterial.image);
    }

    await axios.put(
      `${import.meta.env.VITE_API_URL}/user/materials/${editedMaterial.materialId}`,
      formData,
      { headers: authHeader() }
    );

    alert("✅ Cập nhật thành công!");
    onUpdate();
    onClose();

  } catch (error) {
    console.error("❌ Lỗi khi cập nhật nguyên vật liệu:", error);
    alert(error.response?.data?.message || "Lỗi khi cập nhật nguyên vật liệu!");
  } finally {
    setLoading(false);
  }
};

export const updateMaterial = async (id, formData) => {
  try {
    const response = await axios.put(
      `${API_URL}/${id}`,
      formData,
      {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("✅ [updateMaterial] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật nguyên vật liệu:", error);
    throw error;
  }
};

// Thay đổi trạng thái nguyên vật liệu
export const toggleMaterialStatus = async (materialId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${materialId}/toggle-status`,
      {},
      { headers: authHeader() }
    );
    console.log("✅ [toggleMaterialStatus] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi thay đổi trạng thái nguyên vật liệu:", error);
    throw error;
  }
};

// Lấy danh sách đơn vị
export const fetchUnits = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/units`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách đơn vị:', error);
    throw error;
  }
};

// Lấy danh sách danh mục nguyên vật liệu
export const fetchMaterialCategories = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/material-types`, {
      headers: authHeader()
    });
    console.log("Fetched material categories:", response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách danh mục nguyên vật liệu:', error);
    throw error;
  }
};

// Kiểm tra mã nguyên vật liệu đã tồn tại
export const checkMaterialCodeExists = async (materialCode) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/user/materials/check-material-code/${materialCode}`,
      { headers: authHeader() }
    );
    return response.data.exists;
  } catch (error) {
    console.error("❌ Lỗi kiểm tra mã nguyên vật liệu:", error);
    throw error;
  }
};

// Import Excel
export const importExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/user/materials/import`,
      formData,
      {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data"
        },
      }
    );

    console.log("✅ [importExcel] Import thành công");
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi import file:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Lỗi khi import file");
  }
};

// Export Excel
export const exportExcel = async () => {
  try {
    const response = await axios.get(API_URL, { headers: authHeader() });
    const materials = response.data;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Nguyên vật liệu");

    sheet.columns = [
      { header: "STT", key: "stt", width: 10 },
      { header: "Mã NVL", key: "materialCode", width: 15 },
      { header: "Tên nguyên vật liệu", key: "materialName", width: 25 },
      { header: "Mô tả", key: "description", width: 30 },
      { header: "Giá", key: "price", width: 15 },
      { header: "Đơn vị", key: "unitName", width: 15 },
      { header: "Danh mục", key: "categoryName", width: 20 },
    ];

    materials.forEach((material, index) => {
      sheet.addRow({ stt: index + 1, ...material });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Nguyen_vat_lieu.xlsx");
  } catch (error) {
    console.error("❌ Lỗi khi export Excel:", error);
    throw error;
  }
};

//lấy danh sách các vật liệu đang sử dụng
export const getAllActiveMaterials = async () => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/user/materials/active`,
      { headers: authHeader() }
    );
    return response.data; // Danh sách nguyên vật liệu đang sử dụng
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách nguyên vật liệu đang sử dụng:", error);
    throw error;
  }
};



