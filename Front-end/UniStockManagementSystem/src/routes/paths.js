const paths = {
  home: "/",
  login: "/login",

  // 🔹 Routes dành cho tất cả user đã đăng nhập
  dashboard: "/dashboard",
  inventory: "/inventory",
  orders: "/orders",

  // 🔹 Routes chỉ dành cho ADMIN
  admin: {
    users: "/admin/users",
    roles: "/admin/roles",
    settings: "/admin/settings",
  },

  // 🔹 Routes chỉ dành cho MANAGER
  manager: {
    assembly: "/manager/assembly",
  },

  // 🔹 Routes 404
  notFound: "*",
};

export default paths;
