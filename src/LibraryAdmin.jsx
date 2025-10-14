import React, {useState} from "react";
import {Layout} from "antd";
import Sidebar from "./components/Sidebar";
import BookPage from "./pages/BookPage";
import AuthorPage from "./pages/AuthorPage";
import StudentPage from "./pages/StudentPage";
import CategoryPage from "./pages/CategoryPage";
import PublisherPage from "./pages/PublisherPage";
import BookLoanPage from "./pages/BookLoanPage.jsx";

const {Sider, Content, Header} = Layout;

export default function LibraryAdmin() {
    const [selected, setSelected] = useState("students");

    const renderContent = () => {
        switch (selected) {
            case "books":
                return <BookPage/>;
            case "authors":
                return <AuthorPage/>;
            case "students":
                return <StudentPage/>;
            case "categories":
                return <CategoryPage/>;
            case "publishers":
                return <PublisherPage/>;
            case "bookLoans":
                console.log("bookLoans")
                return <BookLoanPage/>;
            default:
                return null;
        }
    };

    return (
        <Layout style={{minHeight: "100vh"}}>
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
                <Sidebar selectedKey={selected} onSelect={setSelected}/>
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
                    Quản lý {
                    selected === "students" ? "sinh viên" :
                        selected === "books" ? "sách" :
                            selected === "authors" ? "tác giả" :
                                selected === "bookLoans" ? "mượn trả sách" :
                                    "danh mục"}
                </Header>
                <Content style={{padding: 24}}>{renderContent()}</Content>
            </Layout>
        </Layout>
    );
}
