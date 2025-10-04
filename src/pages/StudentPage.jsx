import React from "react";

import CrudTable from "../components/CrudTable";
import {studentService} from "../api/studentService.js";

export default function StudentPage() {
    const columns = [
        {title: "Mã sinh viên", dataIndex: "code"},
        {title: "Họ và tên", dataIndex: "name"},
        {title: "Khoa", dataIndex: "faculty"},
        {title: "Lớp", dataIndex: "class"},
        {title: "Trạng thái", dataIndex: "status"},
    ];
    return <CrudTable type="students" title="sinh viên" columns={columns} api={studentService}/>;
}

