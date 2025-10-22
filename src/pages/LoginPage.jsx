import React, { useState } from "react";
import { Button, Card, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { authService } from "../api/authService";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const res = await authService.login(values.username, values.password);

      // ✅ Lưu token và username
      localStorage.setItem("token", res.token);
      localStorage.setItem("expiresAt", res.expiresAt);
      localStorage.setItem("username", values.username); // 👈 thêm dòng này

      messageApi.success("Đăng nhập thành công!");
      navigate("/");
    } catch (err) {
      messageApi.error("Sai tên đăng nhập hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        background: "#f0f2f5",
      }}
    >
      {contextHolder}
      <Card title="Đăng nhập hệ thống" style={{ width: 360 }}>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input placeholder="Tên đăng nhập" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
          >
            <Input.Password placeholder="Mật khẩu" />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            style={{ width: "100%" }}
          >
            Đăng nhập
          </Button>
        </Form>
      </Card>
    </div>
  );
}
