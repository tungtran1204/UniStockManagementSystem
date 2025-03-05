import React from "react";
import Sidenav from "../components/Sidenav";
import Footer from "../components/Footer";
import DashboardNavbar from "../components/DashboardNavbar";
import { useMaterialTailwindController } from "../context";
import routes from "../routes/routes";
import { useLocation } from "react-router-dom";
import Configurator from "../components/Configurator";

const MainLayout = ({ children }) => {
  const [controller] = useMaterialTailwindController();
  const { sidenavType, openSidenav } = controller; // Lấy openSidenav
  const location = useLocation();
  const specialRoutes = ["/login", "/unauthorized", "/not-found"];

  if (specialRoutes.includes(location.pathname)) {
    return <div>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-blue-gray-50/50 flex overflow-x-hidden">
      {/* Sidebar */}
      <Sidenav
        routes={routes.filter(
          (route) =>
            route.layout !== "default" &&
            route.layout !== "auth" &&
            route.layout !== "other"
        )}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />

      {/* Nội dung chính */}
      <div
        className={`flex flex-col w-full p-4 transition-all duration-300 ${
          openSidenav ? "xl:ml-80" : "ml-0"
        }`}
        style={{
          maxWidth: openSidenav ? "calc(100vw - 320px)" : "100vw",
        }}
      >
        <DashboardNavbar />
        <Configurator />
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