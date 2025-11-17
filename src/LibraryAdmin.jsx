import React, { useEffect, useState } from "react";
import { Layout, Typography, Dropdown, Space, Spin } from "antd";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { DownOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import Sidebar from "./components/Sidebar";
import BookPage from "./pages/BookPage";
import AuthorPage from "./pages/AuthorPage";
import StudentPage from "./pages/StudentPage";
import CategoryPage from "./pages/CategoryPage";
import PublisherPage from "./pages/PublisherPage";
import BookLoanPage from "./pages/BookLoanPage";
import { adminService } from "./api/adminService";

const { Sider, Content, Header } = Layout;
const { Text } = Typography;

export default function LibraryAdmin() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentKey = location.pathname.split("/")[1] || "bookLoans";

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        console.log("111");
        
        const data = await adminService.info();
        console.log("222");
        setUsername(data.fullName || data.username);
        setRole(data.role);
        localStorage.setItem("role", data.role);
      } catch (err) {
        console.error("Lỗi lấy thông tin user:", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserInfo();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleMenuSelect = (key) => {
    navigate(`/${key}`);
  };

  const titleMap = {
    books: "sách",
    authors: "tác giả",
    students: "sinh viên",
    categories: "danh mục",
    publishers: "nhà xuất bản",
    bookLoans: "mượn trả sách",
  };

  const menuItems = [{ key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất" }];

  if (loading) return <Spin style={{ marginTop: 100 }} />;

  const isAdmin = role === "ADMIN";

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
        <Sidebar selectedKey={currentKey} onSelect={handleMenuSelect} role={role} />
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
            Quản lý {titleMap[currentKey] || ""}
          </div>

          <Dropdown
            menu={{
              items: menuItems,
              onClick: ({ key }) => {
                if (key === "logout") handleLogout();
              },
            }}
            placement="bottomRight"
            arrow
          >
            <Space style={{ cursor: "pointer" }}>
              <UserOutlined />
              <Text strong>{username || "Người dùng"}</Text>
              <DownOutlined />
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24 }}>
          <Routes>
            <Route path="/" element={<Navigate to="/bookLoans" />} />
            <Route path="/bookLoans" element={<BookLoanPage />} />
            <Route path="/books" element={<BookPage />} />
            {isAdmin && (
              <>
                <Route path="/authors" element={<AuthorPage />} />
                <Route path="/students" element={<StudentPage />} />
                <Route path="/categories" element={<CategoryPage />} />
                <Route path="/publishers" element={<PublisherPage />} />
              </>
            )}
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}
