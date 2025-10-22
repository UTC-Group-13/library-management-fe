import React, { useState, useEffect } from "react";
import { Layout, Dropdown, Space, Typography } from "antd";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import Sidebar from "./components/Sidebar";
import BookPage from "./pages/BookPage";
import AuthorPage from "./pages/AuthorPage";
import StudentPage from "./pages/StudentPage";
import CategoryPage from "./pages/CategoryPage";
import PublisherPage from "./pages/PublisherPage";
import BookLoanPage from "./pages/BookLoanPage.jsx";
import { useNavigate } from "react-router-dom";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

export default function LibraryAdmin() {
  const [selected, setSelected] = useState("students");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("expiresAt");
    localStorage.removeItem("username");
    navigate("/login");
  };

  const menuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  const renderContent = () => {
    switch (selected) {
      case "books":
        return <BookPage />;
      case "authors":
        return <AuthorPage />;
      case "students":
        return <StudentPage />;
      case "categories":
        return <CategoryPage />;
      case "publishers":
        return <PublisherPage />;
      case "bookLoans":
        return <BookLoanPage />;
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider theme="light" width={220}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 18,
            textAlign: "center",
            padding: "16px 0",
            borderBottom: "1px solid #eee",
          }}
        >
          Thư viện
        </div>
        <Sidebar selectedKey={selected} onSelect={setSelected} />
      </Sider>

      <Layout>
        <Header
          style={{
            background: "#fff",
            borderBottom: "1px solid #eee",
            padding: "0 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 500 }}>
            Quản lý{" "}
            {selected === "students"
              ? "sinh viên"
              : selected === "books"
              ? "sách"
              : selected === "authors"
              ? "tác giả"
              : selected === "bookLoans"
              ? "mượn trả sách"
              : "danh mục"}
          </div>

          <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
            <Space style={{ cursor: "pointer" }}>
              <UserOutlined />
              <Text strong>{username || "Người dùng"}</Text>
              <DownOutlined />
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24 }}>{renderContent()}</Content>
      </Layout>
    </Layout>
  );
}
