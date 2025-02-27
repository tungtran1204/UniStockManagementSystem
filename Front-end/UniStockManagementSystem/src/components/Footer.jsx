import PropTypes from "prop-types";
import { Typography } from "@material-tailwind/react";
import { HeartIcon } from "@heroicons/react/24/solid";

export function Footer({ brandName, brandLink, routes }) {
  const year = new Date().getFullYear();

  return (
<<<<<<< HEAD
    <footer className="py-2">
      <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
        <Typography variant="small" className="font-normal text-inherit">
          &copy; {year}, made with{" "}
          <HeartIcon className="-mt-0.5 inline-block h-3.5 w-3.5 text-red-600" /> by{" "}
          <a
            href={brandLink}
            target="_blank"
            className="transition-colors hover:text-blue-500 font-bold"
          >
            {brandName}
          </a>{" "}
          for a better web.
        </Typography>
        <ul className="flex items-center gap-4">
          {routes.map(({ name, path }) => (
            <li key={name}>
              <Typography
                as="a"
                href={path}
                target="_blank"
                variant="small"
                className="py-0.5 px-1 font-normal text-inherit transition-colors hover:text-blue-500"
              >
                {name}
              </Typography>
            </li>
          ))}
        </ul>
=======
    <footer className="bg-dark text-white text-center p-3 mt-5">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} UniStock Management System</p>
        <p>
          Made with ❤️ by{"Hiroshiba"}
          <a href="https://yourcompany.com" className="text-light">
            Your Company
          </a>
        </p>
>>>>>>> 13837008952e7da7615cbc4a455e699364736d21
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  brandName: "Tungtran",
  brandLink: "https://www.facebook.com/tungdzai1204/",
  routes: [
    { name: "Tungtran", path: "https://www.facebook.com/tungdzai1204/" },
    { name: "About Us", path: "https://www.facebook.com/tungdzai1204/" },
    { name: "Blog", path: "https://www.facebook.com/tungdzai1204/" },
    { name: "License", path: "https://www.facebook.com/tungdzai1204/" },
  ],
};

Footer.propTypes = {
  brandName: PropTypes.string,
  brandLink: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
};

Footer.displayName = "/src/features/admin/dashboard/footer.jsx";

export default Footer;
