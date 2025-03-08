import React from "react";
import Sidenav from "../components/Sidenav";
import Footer from "../components/Footer";
import DashboardNavbar from "../components/DashboardNavbar";
import { useMaterialTailwindController } from "../context";
import routes from "../routes/routes";
import { useLocation } from "react-router-dom";

const MainLayout = ({ children }) => {
  const [controller] = useMaterialTailwindController();
  const { sidenavType, openSidenav } = controller; // Lấy openSidenav
  const location = useLocation();
  const specialRoutes = ["/login", "/unauthorized", "/not-found"];

  if (specialRoutes.includes(location.pathname)) {
    return <div>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-white flex overflow-x-hidden">
      {/* Sidebar */}
      <Sidenav
        routes={routes.filter(
          (route) =>
            route.layout !== "default" &&
            route.layout !== "auth" &&
            route.layout !== "other"
        )}
      />

      {/* Nội dung chính */}
      <div
        className={`flex flex-col transition-all pt-4 duration-300 ${
        openSidenav ? "xl:ml-72 xl:w-[calc(100%-288px)]" : "ml-0 w-full"
          }`}
      >
        <DashboardNavbar />
        {/* <Configurator /> */}
        <div className="flex-grow max-w-full">
          {children}
        </div>
        <div className="text-blue-gray-600 max-w-full">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;