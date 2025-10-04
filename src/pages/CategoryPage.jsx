import React from "react";

import CrudTable from "../components/CrudTable";
import {categoryService} from "../api/categoryService.js";

export default function CategoryPage() {
    const columns = [
        {title: "Mã danh mục", dataIndex: "code"},
        {title: "Tên danh mục", dataIndex: "name"},
    ];
    return <CrudTable type="categories" title="danh mục" columns={columns} api={categoryService}/>;
}

