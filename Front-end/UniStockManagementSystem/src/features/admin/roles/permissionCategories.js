// permissionCategories.js

// Gom nhóm FE-permission thành danh mục
export const PERMISSION_CATEGORIES = {
    "Quản lý sản phẩm": ["viewProduct", "createProduct", "updateProduct"],
    "Quản lý đối tác":  ["viewPartner", "createPartner", "updatePartner"],
    "Quản lý người dùng": ["viewUser", "createUser", "updateUser"],
    // ... tuỳ nhu cầu
  };
  
  // Map key FE => tên hiển thị
  export const PERMISSION_LABELS = {
    viewProduct:   "Xem",
    createProduct: "Thêm",
    updateProduct: "Sửa",
  
    viewPartner:   "Xem",
    createPartner: "Thêm",
    updatePartner: "Sửa",
  
    viewUser:      "Xem",
    createUser:    "Thêm",
    updateUser:    "Sửa",
  
    // v.v. tuỳ ý
  };
  