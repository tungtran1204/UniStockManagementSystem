import axios from "axios";

const API_URL = "http://localhost:8080/api/unistock/user/products";

// Hàm để lấy Token từ LocalStorage
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Lấy danh sách tất cả sản phẩm
// Lấy danh sách sản phẩm phân trang
export const getAllProducts = async (page = 0, size = 10) => {
  try {
    const response = await axios.get(API_URL, { 
      headers: authHeader(),
      params: {
        page: page,
        size: size
      }
    });

    console.log("📌 [getAllProducts] API Response:", response.data);

    // Kiểm tra dữ liệu trả về từ API
    if (response.data && response.data.content) {
      return {
        products: response.data.content,
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || response.data.content.length
      };
    } else {
      console.warn("⚠️ API không trả về dữ liệu hợp lệ!");
      return {
        products: [],
        totalPages: 1,
        totalElements: 0
      };
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách sản phẩm:", error);
    throw error;
  }
};

// Lấy sản phẩm theo ID
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/${productId}`, {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error(`❌ Lỗi khi lấy sản phẩm có ID ${productId}:`, error);
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
    formData.append("productTypeId", parseInt(productData.typeId) || "");
    formData.append("price", parseFloat(productData.price) || 0);
    formData.append("isProductionActive", productData.isProductionActive === "true");

    if (productData.image) {
      formData.append("image", productData.image);
    }

    const response = await axios.post(
      "http://localhost:8080/api/unistock/user/products/create",
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
    const response = await axios.put(`${API_URL}/${productId}`, productData, {
      headers: {
        ...authHeader(),
        "Content-Type": "application/json",
      },
    });
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
      `${API_URL}/${productId}/toggle-production`,
      {},
      { headers: authHeader() }
    );
    console.log("✅ [toggleProductStatus] API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi thay đổi trạng thái sản phẩm:", error);
    throw error;
  }
};

// Các hàm khác giữ nguyên như cũ
export const fetchUnits = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/unistock/user/units', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách đơn vị:', error);
    throw error;
  }
};

export const fetchProductTypes = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/unistock/user/product-types', {
      headers: authHeader()
    });
    return response.data;
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách dòng sản phẩm:', error);
    throw error;
  }
};

export const checkProductCodeExists = async (productCode) => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/unistock/user/products/check-product-code/${productCode}`,
      { headers: authHeader() }
    );
    return response.data.exists;
  } catch (error) {
    console.error("❌ Lỗi kiểm tra mã sản phẩm:", error);
    throw error;
  }
};

export const importExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      "http://localhost:8080/api/unistock/user/products/import",
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

export const exportExcel = async () => {
  try {
    const response = await axios.get(API_URL, { headers: authHeader() });
    const products = response.data;

    // Phần export Excel giữ nguyên
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Sản phẩm");

    sheet.columns = [
      { header: "STT", key: "stt", width: 10 },
      { header: "Tên sản phẩm", key: "productName", width: 25 },
      { header: "Mô tả", key: "description", width: 30 },
      { header: "Giá", key: "price", width: 15 },
      { header: "Đơn vị", key: "unitName", width: 15 },
      { header: "Loại sản phẩm", key: "typeName", width: 20 },
    ];

    products.forEach((product, index) => {
      sheet.addRow({ stt: index + 1, ...product });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "San_pham.xlsx");
  } catch (error) {
    console.error("❌ Lỗi khi export Excel:", error);
    throw error;
  }
};