import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  ArchiveBoxIcon, // Changed from BoxIcon to ArchiveBoxIcon
} from "@heroicons/react/24/solid";

import { Navigate } from "react-router-dom";

import UserPage from "@/features/admin/users/UserPage";
import RolePage from "@/features/admin/roles/RolePage";
import UnauthorizedPage from "@/components/UnauthorizedPage";
import NotFoundPage from "@/components/NotFoundPage";
import LoginPage from "@/features/login/LoginPage";
import AdminDashboard from "@/features/admin/dashboard/AdminDashboard";
import WarehousePage from "@/features/user/warehouse/WarehousePage";
import ProductPage from "@/features/user/products/ProductPage";
import SaleOrdersPage from "../features/user/saleorders/SaleOrdersPage";

const icon = { className: "w-5 h-5 text-inherit" };

export const routes = [
  {
    title: "Default",
    layout: "default",
    pages: [
      {
        path: "/",
        element: <Navigate to="/login" replace />,
      },
    ],
  },
  {
    title: "Admin Routes",
    layout: "admin",
    pages: [
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Admin Dashboard",
        path: "/admin/dashboard",
        element: <AdminDashboard />,
        roles: ["ADMIN"],
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Manage Users",
        path: "/admin/users",
        element: <UserPage />,
        roles: ["ADMIN"],
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Manage Roles",
        path: "/admin/roles",
        element: <RolePage />,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "User Routes",
    layout: "user",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Trang chủ",
        path: "/user/home",
        element: <WarehousePage />,
        roles: ["USER"],
      },
      {
        icon: <ArchiveBoxIcon {...icon} />, // Changed from BoxIcon to ArchiveBoxIcon
        name: "Kho",
        path: "/user/warehouse",
        element: <WarehousePage />,
        roles: ["USER"],
      },
      {
        icon: <TableCellsIcon {...icon} />, // Sử dụng icon tương tự như trang quản lý kho
        name: "Quản lý sản phẩm",
        path: "/user/products",
        element: <ProductPage />, // Trang quản lý sản phẩm
        roles: ["USER"],
      },
      {
        icon: <TableCellsIcon {...icon} />, // Sử dụng icon tương tự như trang quản lý kho
        name: "Quản lý đơn hàng",
        path: "/user/sale-orders",
        element: <SaleOrdersPage />, // Trang quản lý đơn hàng 
        roles: ["USER"],
      },
    
    ],
  },
  {
    title: "Auth Pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "Sign In",
        path: "/login",
        element: <LoginPage />,
      },
    ],
  },
  {
    title: "Other",
    layout: "other",
    pages: [
      {
        path: "/unauthorized",
        element: <UnauthorizedPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];

export default routes;
