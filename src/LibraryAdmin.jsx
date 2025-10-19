import React from "react";
import { Layout } from "antd";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import BookPage from "./pages/BookPage";
import AuthorPage from "./pages/AuthorPage";
import StudentPage from "./pages/StudentPage";
import CategoryPage from "./pages/CategoryPage";
import PublisherPage from "./pages/PublisherPage";
import BookLoanPage from "./pages/BookLoanPage";

const { Sider, Content, Header } = Layout;

export default function LibraryAdmin() {
    const navigate = useNavigate();
    const location = useLocation();

    // lấy key hiện tại từ pathname (vd: /books → books)
    const currentKey = location.pathname.replace("/", "") || "bookLoans";

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
                <Sidebar selectedKey={currentKey} onSelect={handleMenuSelect} />
            </Sider>

            <Layout>
                <Header
                    style={{
                        background: "#fff",
                        borderBottom: "1px solid #eee",
                        padding: "0 24px",
                        fontSize: 18,
                        fontWeight: 500,
                    }}
                >
                    Quản lý {titleMap[currentKey] || ""}
                </Header>

                <Content style={{ padding: 24 }}>
                    <Routes>
                        <Route path="/" element={<Navigate to="/bookLoans" />} />
                        <Route path="/bookLoans" element={<BookLoanPage />} />
                        <Route path="/books" element={<BookPage />} />
                        <Route path="/authors" element={<AuthorPage />} />
                        <Route path="/students" element={<StudentPage />} />
                        <Route path="/categories" element={<CategoryPage />} />
                        <Route path="/publishers" element={<PublisherPage />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
}
