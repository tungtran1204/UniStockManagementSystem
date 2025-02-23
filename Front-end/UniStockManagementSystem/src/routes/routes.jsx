import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  Bars3BottomRightIcon,
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
import PartnerTypePage from "@/features/user/partnerType/PartnerTypePage";

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
    title: "Quản lý",
    layout: "admin",
    pages: [
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Bảng Điều Khiển",
        path: "/admin/dashboard",
        element: <AdminDashboard />,
        roles: ["ADMIN"],
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Quản Lý Người Dùng",
        path: "/admin/users",
        element: <UserPage />,
        roles: ["ADMIN"],
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Quản Lý Vai Trò",
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
        icon: <UserCircleIcon {...icon} />,
        name: "Quản lý đối tác",
        path: "/user/partner",
        roles: ["USER"],
        element: <Navigate to="/user/partner/type" replace />, // Add a default redirect
        subPages: [
          {
            icon: <Bars3BottomRightIcon {...icon} />,
            name: "Nhóm đối tác",
            path: "/user/partner/type", // Relative path
            element: <PartnerTypePage />,
            roles: ["USER"],
          },
          {
            icon: <Bars3BottomRightIcon {...icon} />,
            name: "Đối tác",
            path: "/user/partner/list", // Relative path
            element: <div>Partners Page</div>, // Placeholder for Partners Page
            roles: ["USER"],
          },
        ],
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
