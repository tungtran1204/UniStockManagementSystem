// permissionMapping.js

// 1) Map từ permission BE => permission FE
export const BACKEND_TO_FRONTEND = {
    // Gom nhóm cho "Sản phẩm"
    getAllProducts:   "viewProduct",
    getProductById:   "viewProduct",
    checkProductCode: "viewProduct",
  
    createProduct:    "createProduct",
    updateProduct:    "updateProduct",
  
    // Gom nhóm cho "Đối tác"
    getAllPartnerTypes:  "viewPartner",
    createPartnerType:   "createPartner",
    updatePartnerType:   "updatePartner",
  
    // Gom nhóm cho "Người dùng"
    getUserById:   "viewUser",
    addUser:       "createUser",
    updateUser:    "updateUser",
    deleteUser:    "deleteUser", // tuỳ bạn
    // ... v.v. (thêm tuỳ nhu cầu)
  
    // Bạn có thể thêm các key BE khác...
  };
  
  // 2) Hàm chuyển list permission BE => FE
  export function mapBackendPermsToFrontEnd(backendPerms) {
    const frontEndPerms = new Set();
    backendPerms.forEach((beKey) => {
      const feKey = BACKEND_TO_FRONTEND[beKey];
      if (feKey) {
        frontEndPerms.add(feKey);
      }
    });
    return [...frontEndPerms]; // trả về mảng FE-perms
  }
  
  // 3) Tạo map ngược FE => BE
  //    Mục đích: khi lưu, "viewProduct" -> ["getAllProducts","getProductById","checkProductCode"], v.v.
  export const FRONTEND_TO_BACKEND = {};
  
  // Tự động xây dựng map ngược
  Object.keys(BACKEND_TO_FRONTEND).forEach((beKey) => {
    const feKey = BACKEND_TO_FRONTEND[beKey];
    if (!FRONTEND_TO_BACKEND[feKey]) {
      FRONTEND_TO_BACKEND[feKey] = [];
    }
    FRONTEND_TO_BACKEND[feKey].push(beKey);
  });
  
  // 4) Hàm chuyển list permission FE => BE
  export function mapFrontEndPermsToBackend(frontEndPerms) {
    const result = new Set();
    frontEndPerms.forEach((feKey) => {
      const beKeys = FRONTEND_TO_BACKEND[feKey] || [];
      beKeys.forEach((k) => result.add(k));
    });
    return [...result]; // trả về mảng BE-perms
  }
  