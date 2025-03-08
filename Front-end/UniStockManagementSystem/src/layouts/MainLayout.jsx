import React from "react";
import Sidenav from "../components/Sidenav";
import Footer from "../components/Footer";
import DashboardNavbar from "../components/DashboardNavbar";
import { useMaterialTailwindController } from "../context";
import routes from "../routes/routes";
import { useLocation } from "react-router-dom";
// import Configurator from "../components/Configurator";

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
        className={`flex flex-col w-full pt-4 transition-all duration-300 ${
          openSidenav ? "xl:ml-72" : "ml-0"
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