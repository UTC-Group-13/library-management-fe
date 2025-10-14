import React from "react";
import { Menu } from "antd";
import {
    BookOutlined,
    UserOutlined,
    TeamOutlined,
    AppstoreOutlined,
    BankOutlined,
} from "@ant-design/icons";

export default function Sidebar({ selectedKey, onSelect }) {
    const items = [
        { key: "books", icon: <BookOutlined />, label: "Quản lý sách" },
        { key: "authors", icon: <UserOutlined />, label: "Quản lý tác giả" },
        { key: "students", icon: <TeamOutlined />, label: "Quản lý sinh viên" },
        { key: "categories", icon: <AppstoreOutlined />, label: "Quản lý danh mục" },
        { key: "publishers", icon: <BankOutlined />, label: "Quản lý nhà xuất bản" },
        { key: "bookLoans", icon: <AppstoreOutlined />, label: "Quản lý mượn trả" },
    ];

    return (
        <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={items}
            onClick={(e) => onSelect(e.key)}
            style={{ height: "100%", borderRight: 0 }}
        />
    );
}