import React from "react";
import { createRoot } from "react-dom/client";
import LibraryAdmin from "./LibraryAdmin";
import { App as AntdApp } from "antd"; // 👈 import thêm dòng này
import "antd/dist/reset.css";

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AntdApp>    {/* 👈 Bọc toàn bộ ứng dụng ở đây */}
            <LibraryAdmin />
        </AntdApp>
    </React.StrictMode>
);