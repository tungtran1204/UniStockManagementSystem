import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useLogin from "./useLogin";

const LoginPage = () => {
  const { handleLogin } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await handleLogin(email, password);

    if (result.success) {
      const userRole = result.user.role;
      console.log("✅ Role:", userRole);

      if (userRole === "ADMIN") {
        navigate("/admin");
      } else if (userRole === "MANAGER") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="w-full max-w-md bg-white shadow-xl rounded-lg p-8">
          <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Welcome Back 👋
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                           focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold 
                         hover:bg-green-700 hover:scale-105 transition-all duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
