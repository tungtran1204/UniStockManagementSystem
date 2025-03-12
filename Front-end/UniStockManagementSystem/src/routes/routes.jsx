import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  Bars3BottomRightIcon,
  ArchiveBoxIcon,
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
import PartnerTypePage from "@/features/user/partnerType/PartnerTypePage";
import PartnerPage from "@/features/user/partner/PartnerPage";
import MaterialPage from "@/features/user/materials/MaterialPage";

import ReceiptNotePage from "../features/user/receiptNote/ReceiptNotePage";
import AddSaleOrderPage from "../features/user/saleorders/AddSaleOrderPage";
import AddReceiptNote from "../features/user/receiptNote/AddReceiptNote";
import IssueNotePage from "../features/user/issueNote/IssueNotePage";
import AddIssueNote from "../features/user/receiptNote/AddReceiptNote";
import PurchaseOrderPage from "../features/user/purchaseOrder/purchaseOrderPage";
import AddProductPage from "@/features/user/products/AddProductPage";
import DetailProductPage from "@/features/user/products/DetailProductPage";
import EditSaleOrderPage from "../features/user/saleorders/EditSaleOrderPage";
import PurchaseOrderDetail from "../features/user/purchaseOrder/purchaseOrderDetail";

import ProductTypePage from "@/features/user/productType/ProductTypePage";
import PurchaseRequestPage from "@/features/user/purchaseRequest/PurchaseRequestPage";
import AddPurchaseRequestPage from "../features/user/purchaseRequest/AddPurchaseRequestPage";
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
    title: "",
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
        name: "Người Dùng",
        path: "/admin/users",
        element: <UserPage />,
        roles: ["ADMIN"],
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "Vai Trò",
        path: "/admin/roles",
        element: <RolePage />,
        roles: ["ADMIN"],
      },
    ],
  },
  {
    title: "",
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
        icon: <TableCellsIcon {...icon} />, // Sử dụng icon tương tự như trang quản lý kho
        name: "Đơn bán hàng",
        path: "/user/sale-orders",
        element: <SaleOrdersPage />, // Trang quản lý đơn hàng 
        roles: ["USER"],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Xuất nhập kho",
        path: "/user/receiptNote",
        roles: ["USER"],
        element: <Navigate to="/user" replace />,
        subPages: [
          {
            icon: <Bars3BottomRightIcon {...icon} />,
            name: "Nhập kho",
            path: "/user/receiptNote",
            element: <ReceiptNotePage />,
            roles: ["USER"],
          },
          {
            icon: <Bars3BottomRightIcon {...icon} />,
            name: "Xuất kho",
            path: "/user/issueNote",
            element: <IssueNotePage />,
            roles: ["USER"],
          },
        ],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Mua hàng",
        path: "/user/purchaseOrder",
        roles: ["USER"],
        element: <Navigate to="/user/purchaseOrder" replace />,
        subPages: [
          {
            icon: <Bars3BottomRightIcon {...icon} />,
            name: "Yêu cầu mua",
            path: "/user/",
            element: <PurchaseOrderPage />,
            roles: ["USER"],
          },
          {
            icon: <Bars3BottomRightIcon {...icon} />,
            name: "Đơn mua hàng",
            path: "/user/purchaseOrder",
            element: <PurchaseOrderPage />,
            roles: ["USER"],
          },
        ],
      },
      {
        icon: <ArchiveBoxIcon {...icon} />,
        name: "Kho",
        path: "/user/warehouse",
        element: <WarehousePage />,
        roles: ["USER"],
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Sản phẩm",
        path: "/user/products",
        element: <Navigate to="/user/products" replace />,
        roles: ["USER"],
        subPages: [
          {
            icon: <Bars3BottomRightIcon {...icon} />,
            name: "Sản phẩm",
            path: "/user/products",
            element: <ProductPage />,
            roles: ["USER"],
          },
          {
            icon: <Bars3BottomRightIcon {...icon} />,
            name: "Dòng sản phẩm",
            path: "/user/products-types",
            element: <ProductTypePage/>,
            roles: ["USER"],
          },
        ],
      },
      {
        icon: <TableCellsIcon {...icon} />, // Sử dụng TableCellsIcon cho phần quản lý nguyên vật liệu
        name: "Vật tư",
        path: "/user/materials",
        element: <MaterialPage />,
        roles: ["USER"],
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Yêu cầu mua vật tư",
        path: "/user/purchase-request",
        element: <PurchaseRequestPage />,
        roles: ["USER"],
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Đối tác",
        path: "/user/partner",
        roles: ["USER"],
        element: <Navigate to="/user/partner/type" replace />,
        subPages: [
          {
            icon: <Bars3BottomRightIcon {...icon} />,
            name: "Nhóm đối tác",
            path: "/user/partner/type",
            element: <PartnerTypePage />,
            roles: ["USER"],
          },
          {
            icon: <Bars3BottomRightIcon {...icon} />,
            name: "Đối tác",
            path: "/user/partner/list", // Relative path
            element: <PartnerPage />, 
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
      {
        icon: <TableCellsIcon {...icon} />, // Sử dụng icon tương tự như trang quản lý kho
        name: "Thêm đơn hàng",
        path: "/user/sale-orders/add",
        element: <AddSaleOrderPage />, // Trang quản lý đơn hàng 
        roles: ["USER"],
      },

      {
        icon: <TableCellsIcon {...icon} />, // Sử dụng icon tương tự như trang quản lý kho
        name: "Sửa đơn hàng",
        path: "/user/sale-orders/:orderId",
        element: <EditSaleOrderPage />, // Trang quản lý đơn hàng 
        roles: ["USER"],
      },

      {
        icon: <TableCellsIcon {...icon} />, // Sử dụng icon tương tự như trang quản lý kho
        name: "Thêm phiếu nhập",
        path: "/user/receiptNote/add",
        element: <AddReceiptNote />, // Trang quản lý đơn hàng 
        roles: ["USER"],
      },
      {
        icon: <TableCellsIcon {...icon} />, // Sử dụng icon tương tự như trang quản lý kho
        name: "Thêm phiếu xuất",
        path: "/user/issueNote/add",
        element: <AddIssueNote />, // Trang quản lý đơn hàng 
        roles: ["USER"],
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Thêm sản phẩm",
        path: "/user/products/add",
        element: <AddProductPage />,
        roles: ["USER"],
      },
      {
        path: "/user/products/:id",
        element: <DetailProductPage />,
        roles: ["USER"],
      },
      {
        path: "/user/purchaseOrder/:orderId",
        element: <PurchaseOrderDetail />,
        roles: ["USER"],
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Thêm yêu cầu mua vật tư",
        path: "/user/purchase-request/add",
        element: <AddPurchaseRequestPage />,
        roles: ["USER"],
      },
    ],
  },
];

export default routes;