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
  const { sidenavType } = controller;
  const location = useLocation();
  const specialRoutes = ["/login", "/unauthorized", "/not-found"];

  if (specialRoutes.includes(location.pathname)) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-blue-gray-50/50 flex">
      <Sidenav
        routes={routes.filter(route => route.layout !== "default")}
        brandImg={sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"}
      />

      <div className="flex flex-col w-full p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        <div className="flex-grow">
          {children}
        </div>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
