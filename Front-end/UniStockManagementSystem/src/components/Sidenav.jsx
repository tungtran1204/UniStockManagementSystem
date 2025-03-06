import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import {
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;
  const { user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);

  // Chuyển đổi role thành mảng nếu cần
  const userRoles = Array.isArray(user?.roles)
    ? user.roles
    : typeof user?.roles === "string"
    ? user.roles.split(",").map((role) => role.trim())
    : [];

  if (!routes) {
    return <div>No routes available</div>;
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 h-screen w-[280px] bg-white shadow-lg transition-transform duration-300 ${
        openSidenav ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* Logo + Close Button */}
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <Link to="/home">
          <img src={brandImg} alt="Brand Logo" className="h-10" />
        </Link>
        <IconButton
          variant="text"
          size="sm"
          onClick={() => setOpenSidenav(dispatch, false)}
          className="xl:hidden"
        >
          <XMarkIcon strokeWidth={2} className="h-6 w-6 text-gray-600" />
        </IconButton>
      </div>

      {/* Menu */}
      <nav className="p-4">
        {routes.map(({ layout, title, pages }, key) => {
          // Lọc menu theo quyền của user
          const filteredPages = pages.filter(({ roles }) =>
            roles ? roles.some((role) => userRoles.includes(role)) : true
          );

          if (filteredPages.length === 0) return null;

          return (
            <div key={key} className="mb-4">
              {title && (
                <Typography
                  variant="small"
                  className="text-gray-600 text-xs uppercase font-semibold"
                >
                  {title}
                </Typography>
              )}
              <ul className="space-y-2">
                {filteredPages.map(({ icon, name, path, subPages }) => (
                  <li key={name}>
                    {subPages ? (
                      <>
                        <button
                          className="flex items-center justify-between w-full px-4 py-3 text-gray-700 hover:text-black rounded-lg hover:bg-gray-100 transition-all"
                          onClick={() =>
                            setOpenDropdown(openDropdown === name ? null : name)
                          }
                        >
                          <div className="flex items-center gap-3">
                            {icon}
                            <span className="text-sm font-small">{name}</span>
                          </div>
                          {openDropdown === name ? (
                            <ChevronUpIcon className="h-5 w-5" />
                          ) : (
                            <ChevronDownIcon className="h-5 w-5" />
                          )}
                        </button>

                        {/* Dropdown Submenu */}
                        {openDropdown === name && (
                          <ul className="ml-6 mt-2 space-y-1">
                            {subPages.map(({ icon, name, path }) => (
                              <li key={name}>
                                <NavLink
                                  to={path}
                                  className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
                                      isActive
                                        ? "bg-[#0ab067] text-white"
                                        : "text-gray-700 hover:bg-[#089b5b] hover:text-white"
                                    }`
                                  }
                                >
                                  {icon}
                                  <span className="text-sm">{name}</span>
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <NavLink
                        to={path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                            isActive
                              ? "bg-[#0ab067] text-white"
                              : "text-gray-700 hover:bg-[#089b5b] hover:text-white"
                          }`
                        }
                      >
                        {icon}
                        <span className="text-sm font-medium">{name}</span>
                      </NavLink>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>
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