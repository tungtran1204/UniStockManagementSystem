import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : typeof user?.roles === "string"
    ? user.roles.split(",").map((role) => role.trim())
    : [];

  if (!routes) return <div>No routes available</div>;

  return (
    <aside
      className={`fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-64 rounded-xl border border-blue-gray-100 transition-transform duration-300 ${
        openSidenav ? "translate-x-0 opacity-100" : "-translate-x-80"
      } ${sidenavTypes[sidenavType]}`}
    >
      <div className="relative flex items-center justify-between p-4">
        <Link to="/home" className="text-center">
          <Typography
            variant="small"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
            className="text-sm"
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          className="xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>

      <div className="p-2">
        {routes.map(({ layout, title, pages }, key) => {
          const filteredPages = pages.filter(({ roles }) =>
            roles ? roles.some((role) => userRoles.includes(role)) : true
          );

          if (filteredPages.length === 0) return null;

          return (
            <ul key={key} className="mb-2 flex flex-col gap-1">
              {title && (
                <li className="mx-3 mt-2 mb-1">
                  <Typography
                    variant="small"
                    color={sidenavType === "dark" ? "white" : "blue-gray"}
                    className="text-xs font-bold uppercase opacity-75"
                  >
                    {title}
                  </Typography>
                </li>
              )}
              {filteredPages.map(({ icon, name, path, subPages }) => (
                <li key={name} className="mb-1">
                  {subPages ? (
                    <>
                      <Button
                        variant="text"
                        color={sidenavType === "dark" ? "white" : "blue-gray"}
                        className="flex items-center justify-between px-3 py-2 capitalize text-xs"
                        fullWidth
                        onClick={() => setOpenDropdown(openDropdown === name ? null : name)}
                      >
                        <div className="flex items-center gap-2">
                          {icon}
                          <Typography color="inherit" className="text-xs font-medium capitalize">
                            {name}
                          </Typography>
                        </div>
                        {openDropdown === name ? (
                          <ChevronUpIcon className="w-4 h-4" />
                        ) : (
                          <ChevronDownIcon className="w-4 h-4" />
                        )}
                      </Button>
                      {openDropdown === name && (
                        <ul className="ml-3">
                          {subPages.map(({ icon, name, path }) => (
                            <li key={name} className="my-1">
                              <NavLink to={path}>
                                {({ isActive }) => (
                                  <Button
                                    variant={isActive ? "gradient" : "text"}
                                    color={isActive ? sidenavColor : sidenavType === "dark" ? "white" : "blue-gray"}
                                    className="flex items-center gap-2 px-3 py-2 capitalize text-xs"
                                    fullWidth
                                  >
                                    {icon}
                                    <Typography color="inherit" className="text-xs font-medium capitalize">
                                      {name}
                                    </Typography>
                                  </Button>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  ) : (
                    <NavLink to={path}>
                      {({ isActive }) => (
                        <Button
                          variant={isActive ? "gradient" : "text"}
                          color={isActive ? sidenavColor : sidenavType === "dark" ? "white" : "blue-gray"}
                          className="flex items-center gap-2 px-3 py-2 capitalize text-xs"
                          fullWidth
                        >
                          {icon}
                          <Typography color="inherit" className="text-xs font-medium capitalize">
                            {name}
                          </Typography>
                        </Button>
                      )}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          );
        })}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "UniStock",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/components/Sidenav.jsx";

export default Sidenav;