import React, { useState } from "react";
import { Form, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useLogin from "./useLogin";

const LoginPage = () => {
  const { handleLogin } = useLogin(); // ✅ Sử dụng hook đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);

    const result = await handleLogin(email, password);

    if (result.success) {
      const userRole = result.user.role; // ✅ Lấy role từ user
      console.log("✅ Role:", userRole);

      // ✅ Điều hướng theo vai trò
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
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="p-4 shadow rounded"
        style={{ backgroundColor: "#f8f9fa", width: "400px", margin: "auto" }}
      >
        <h3 className="text-center mb-4">Login</h3>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          {error && <p className="text-danger">{error}</p>}

          <Button variant="success" type="submit" className="w-100">
            Login
          </Button>
        </Form>
      </div>
    </Container>
  );
};

export default LoginPage;
