import React from "react";

const Footer = () => {
  return (
    <footer className="bg-dark text-white text-center p-3 mt-5">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} UniStock Management System</p>
        <p>
          Made with ❤️ by{" "}
          <a href="https://yourcompany.com" className="text-light">
            Your Company
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
