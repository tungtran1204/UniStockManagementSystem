import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="container mx-auto p-4">
          <AppRoutes />
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
};

export default App;
