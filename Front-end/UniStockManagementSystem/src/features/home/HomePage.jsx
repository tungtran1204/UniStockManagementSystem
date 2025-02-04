import React from "react";
import { Link } from "react-router-dom";
import { Container, Button, Card } from "react-bootstrap";

const HomePage = () => {
  return (
    <Container className="text-center mt-5">
      <Card className="p-4 bg-light rounded">
        <Card.Body>
          <h1>🚀 Chào mừng đến với UniStock</h1>
          <p className="lead">
            Hệ thống quản lý kho sản xuất xe điện, giúp bạn kiểm soát tồn kho,
            lắp ráp và đơn hàng dễ dàng.
          </p>
          <hr />
          <p>Bạn có thể bắt đầu bằng cách truy cập các tính năng chính:</p>
          <div className="mt-4">
            <Button as={Link} to="/inventory" variant="primary" className="m-2">
              📦 Quản lý Kho
            </Button>
            <Button as={Link} to="/assembly" variant="success" className="m-2">
              🔧 Lắp Ráp Xe
            </Button>
            <Button as={Link} to="/orders" variant="warning" className="m-2">
              📝 Quản lý Đơn Hàng
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default HomePage;
