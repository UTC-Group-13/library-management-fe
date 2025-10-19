import React from "react";
import {createRoot} from "react-dom/client";
import LibraryAdmin from "./LibraryAdmin";
import {App as AntdApp} from "antd"; // 👈 import thêm dòng này
import "antd/dist/reset.css";
import {BrowserRouter} from "react-router-dom";

createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <AntdApp>
                <LibraryAdmin/>
            </AntdApp>
        </BrowserRouter>
    </React.StrictMode>
);