import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/user`;

// Hàm để lấy Token từ LocalStorage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Lấy danh sách tất cả sản phẩm
export const getAllProducts = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(`${API_URL}/products`, {
      headers: authHeader(),
      params: {
        page: page,
        size: size,
      },
    });

    console.log("📌 [getAllProducts] API Response:", response.data);

    if (response.data && response.data.content) {
      return {
        products: response.data.content,
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || response.data.content.length,
      };
    } else {
      console.warn("⚠️ API không trả về dữ liệu hợp lệ!");
      return {
        products: [],
        totalPages: 1,
        totalElements: 0,
      };
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error.response?.data || error.message);
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`, {
      headers: authHeader(),
    });
    console.log("📌 [getProductById] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(`❌ Lỗi khi lấy sản phẩm có ID ${productId}:`, error.response?.data || error.message);
    throw error;
  }
};

// Tạo sản phẩm mới
export const createProduct = async (productData) => {
  try {
    const formData = new FormData();

    formData.append("productCode", productData.productCode.trim());
    formData.append("productName", productData.productName.trim());
    formData.append("description", productData.description?.trim() || "");
    formData.append("unitId", parseInt(productData.unitId) || "");
    formData.append("typeId", parseInt(productData.productTypeId) || "");
    formData.append("isProductionActive", productData.isProductionActive === true || productData.isProductionActive === "true");

    if (productData.image) {
      formData.append("image", productData.image);
    }

    formData.append("materials", JSON.stringify(productData.materials || []));

    const response = await axios.post(
      `${API_URL}/products/create`,
      formData,
      {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ [createProduct] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo sản phẩm:", error.response?.data || error.message);
    throw error;
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (productId, productData) => {
  try {
    const formData = new FormData();

    formData.append("productCode", productData.productCode?.trim() || "");
    formData.append("productName", productData.productName.trim());
    formData.append("description", productData.description?.trim() || "");
    formData.append("unitId", parseInt(productData.unitId) || "");
    formData.append("typeId", parseInt(productData.typeId) || "");
    formData.append("isProductionActive", productData.isProductionActive === true || productData.isProductionActive === "true");

    if (productData.image) {
      formData.append("image", productData.image);
    }

    // Lọc và chuẩn hóa materials trước khi gửi
    const filteredMaterials = (productData.materials || []).map(material => ({
      materialId: material.materialId,
      quantity: material.quantity,
      materialCode: material.materialCode,
      materialName: material.materialName
    }));
    formData.append("materials", JSON.stringify(filteredMaterials));

    const response = await axios.put(
      `${API_URL}/products/${productId}`,
      formData,
      {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ [updateProduct] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error.response?.data || error.message);
    throw error;
  }
};

// Thay đổi trạng thái sản xuất
export const toggleProductStatus = async (productId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/products/${productId}/toggle-production`,
      {},
      { headers: authHeader() }
    );
    console.log("✅ [toggleProductStatus] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi thay đổi trạng thái sản phẩm:", error.response?.data || error.message);
    throw error;
  }
};

// Lấy danh sách đơn vị
export const fetchUnits = async () => {
  try {
    const response = await axios.get(`${API_URL}/units`, {
      headers: authHeader(),
    });
    console.log("📌 [fetchUnits] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách đơn vị:", error.response?.data || error.message);
    throw error;
  }
};

// Lấy danh sách dòng sản phẩm
export const fetchProductTypes = async () => {
  try {
    const response = await axios.get(`${API_URL}/product-types`, {
      headers: authHeader()
    });
    
    // Check if response.data has content property (paginated response)
    if (response.data && response.data.content) {
      return response.data.content.filter(type => type.status === true);
    }
    
    // If response.data is direct array
    if (Array.isArray(response.data)) {
      return response.data.filter(type => type.status === true);
    }

    console.warn("Unexpected response format:", response.data);
    return [];
  } catch (error) {
    console.error("Error fetching product types:", error);
    throw error;
  }
};

// Kiểm tra mã sản phẩm đã tồn tại
export const checkProductCodeExists = async (productCode, excludeId = null) => {
  try {
    const response = await axios.get(
      `${API_URL}/products/check-product-code/${productCode}`,
      { headers: authHeader(), params: { excludeId } }
    );
    console.log("📌 [checkProductCodeExists] API Response:", response.data);
    return response.data.exists;
  } catch (error) {
    console.error("❌ Lỗi kiểm tra mã sản phẩm:", error.response?.data || error.message);
    throw error;
  }
};

// Import sản phẩm từ Excel
export const importExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `${API_URL}/products/import`,
      formData,
      {
        headers: {
          ...authHeader(),
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("✅ [importExcel] Import thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi import file:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Lỗi khi import file");
  }
};

// Export sản phẩm ra Excel
export const exportExcel = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`, { headers: authHeader() });
    const products = response.data.content;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sản phẩm");

    sheet.columns = [
      { header: "STT", key: "stt", width: 10 },
      { header: "Mã sản phẩm", key: "productCode", width: 15 },
      { header: "Tên sản phẩm", key: "productName", width: 25 },
      { header: "Mô tả", key: "description", width: 30 },
      { header: "Đơn vị", key: "unitName", width: 15 },
      { header: "Loại sản phẩm", key: "typeName", width: 20 },
      { header: "Trạng thái sản xuất", key: "isProductionActive", width: 20 },
    ];

    products.forEach((product, index) => {
      sheet.addRow({
        stt: index + 1,
        productCode: product.productCode,
        productName: product.productName,
        description: product.description,
        unitName: product.unitName,
        typeName: product.typeName,
        isProductionActive: product.isProductionActive ? "Hoạt động" : "Ngừng hoạt động",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "San_pham.xlsx");
  } catch (error) {
    console.error("❌ Lỗi khi export Excel:", error.response?.data || error.message);
    throw error;
  }
};