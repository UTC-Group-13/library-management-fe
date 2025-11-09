import React from "react";
import { Menu } from "antd";
import {
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  AppstoreOutlined,
  BankOutlined,
} from "@ant-design/icons";

export default function Sidebar({ selectedKey, onSelect, role }) {
  // Danh sách menu đầy đủ
  const allItems = [
    { key: "bookLoans", icon: <AppstoreOutlined />, label: "Quản lý mượn trả" },
    { key: "books", icon: <BookOutlined />, label: "Quản lý sách" },
    { key: "authors", icon: <UserOutlined />, label: "Quản lý tác giả" },
    { key: "students", icon: <TeamOutlined />, label: "Quản lý sinh viên" },
    { key: "categories", icon: <AppstoreOutlined />, label: "Quản lý danh mục" },
    { key: "publishers", icon: <BankOutlined />, label: "Quản lý nhà xuất bản" },
  ];

  // Lọc menu theo role
  const filteredItems =
    role === "ADMIN"
      ? allItems
      : allItems.filter((item) => ["bookLoans", "books"].includes(item.key));

  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      items={filteredItems}
      onClick={(e) => onSelect(e.key)}
      style={{ height: "100%", borderRight: 0 }}
    />
  );
}
