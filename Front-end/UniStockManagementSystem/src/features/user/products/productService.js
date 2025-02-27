import axios from "axios";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";


const API_URL = "http://localhost:8080/api/unistock/user/products";

const authHeader = () => {
  const token = localStorage.getItem("token");

  if (!token) {
    console.warn("🚨 Không tìm thấy token trong localStorage!");
    return {};
  }

  console.log("🔑 Gửi Token:", token);
  return { Authorization: `Bearer ${token}` };
};

// ✅ Lấy danh sách tất cả sản phẩm
export const getAllProducts = async () => {
  const headers = authHeader();
  console.log("📢 [getPartnerTypes] Headers:", headers);
    const response = await axios.get(API_URL, { headers });
  return response.data;
};

// ✅ Lấy sản phẩm theo userId
export const getUserProducts = async (userId) => {
  const response = await axios.get(`${API_URL}/${userId}`);
  return response.data;
};

// ✅ Thêm sản phẩm mới 
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

    // 🟢 Kiểm tra và thêm ảnh vào FormData
    if (productData.image) {
      formData.append("image", productData.image);
    } else {
      console.warn("⚠️ No image attached");
    }

    const response = await axios.post(
      "http://localhost:8080/api/unistock/user/products/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo sản phẩm:", error.response?.data || error.message);
    throw error;
  }
};




export const fetchUnits = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/unistock/user/units');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn vị:', error);
    throw error;
  }
};



export const fetchProductTypes = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/unistock/user/product-types');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách dòng sản phẩm:', error);
    throw error;
  }
};


export const getProductById = async (productId) => {
  const response = await axios.get(`${API_URL}/${productId}`);
  return response.data;
};

// 🆕 Cập nhật sản phẩm
export const updateProduct = async (productId, productData) => {
  try {
    const response = await axios.put(`${API_URL}/${productId}`, productData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật sản phẩm:", error.response?.data || error.message);
    throw error;
  }
};

export const checkProductCodeExists = async (productCode) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/unistock/user/products/check-product-code/${productCode}`);
    return response.data.exists;
  } catch (error) {
    console.error("Lỗi kiểm tra mã sản phẩm:", error);
    throw error;
  }
};


export const importExcel = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file); // ✅ Đảm bảo tên phải là "file"

    const response = await axios.post("http://localhost:8080/api/unistock/user/products/import", formData, {
      headers: { 
        "Content-Type": "multipart/form-data" // ❌ Không thêm thủ công, axios sẽ tự đặt
      },
    });

    return response.data;
  } catch (error) {
    console.error("❌ Chi tiết lỗi:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Lỗi khi import file");
  }
};



export const exportExcel = async () => {
  const response = await axios.get(API_URL);
  const products = response.data;

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
};