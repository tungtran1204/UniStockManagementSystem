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

  // ✅ Chuyển role về dạng mảng nếu cần
  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : typeof user?.roles === "string"
    ? user.roles.split(",").map((role) => role.trim())
    : [];

  if (!routes) {
    return <div>No routes available</div>;
  }

  const handleDropdownClick = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300  border border-blue-gray-100`}
    >
      <div className="relative">
        <Link to="/" className="py-6 px-8 text-center">
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none "
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>

      <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => {
          // ✅ Lọc menu theo role
          const filteredPages = pages.filter(({ roles }) =>
            roles ? roles.some((role) => userRoles.includes(role)) : true
          );

          // ✅ Ẩn category nếu không có item nào hợp lệ
          if (filteredPages.length === 0) return null;

            return (
            <ul key={key} className="mb-4 flex flex-col gap-1">
              {title && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                variant="small"
                color={sidenavType === "dark" ? "white" : "blue-gray"}
                className="font-black uppercase opacity-75"
                >
                {title}
                </Typography>
              </li>
              )}
              {filteredPages.map(({ icon, name, path, subPages }) => (
              <li key={name}>
                {subPages ? (
                <>
                  <Button
                  variant="text"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="flex items-center justify-between gap-4 px-4 capitalize"
                  fullWidth
                  onClick={() => handleDropdownClick(name)}
                  >
                  <div className="flex items-center gap-4">
                    {icon}
                    <Typography
                    color="inherit"
                    className="font-medium capitalize"
                    >
                    {name}
                    </Typography>
                  </div>
                  {openDropdown === name ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                  </Button>
                  {openDropdown === name && (
                  <ul className="ml-4">
                    {subPages.map(({ icon, name, path }) => (
                    <li key={name}>
                      <NavLink to={path}>
                      {({ isActive }) => (
                        <Button
                        variant={isActive ? "gradient" : "text"}
                        color={
                          isActive
                          ? sidenavColor
                          : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                        }
                        className="flex items-center gap-4 px-4 capitalize"
                        fullWidth
                        >
                        {icon}
                        <Typography
                          color="inherit"
                          className="font-medium capitalize"
                        >
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
                    color={
                    isActive
                      ? sidenavColor
                      : sidenavType === "dark"
                      ? "white"
                      : "blue-gray"
                    }
                    className="flex items-center gap-4 px-4 capitalize"
                    fullWidth
                  >
                    {icon}
                    <Typography
                    color="inherit"
                    className="font-medium capitalize"
                    >
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
