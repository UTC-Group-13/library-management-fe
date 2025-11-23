import React, { useEffect, useState } from "react";
import {
    Button,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Space,
    Table,
} from "antd";
import { studentService } from "../api/studentService";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";

const { Search } = Input;

export default function StudentPage() {

    const [messageApi, contextHolder] = message.useMessage();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    const [keyword, setKeyword] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const [form] = Form.useForm();

    // === FETCH API ===
    const fetchData = async (page = 1, size = 10, searchValue = "") => {
        setLoading(true);
        try {
            const res = await studentService.search({
                page: page - 1,
                size,
                search: searchValue || "",
                sortBy: "id",
                sortDir: "desc",
            });

            setData(res.content || []);
            setPagination({
                current: res.pageable?.pageNumber + 1 || 1,
                pageSize: res.pageable?.pageSize || 10,
                total: res.totalElements || 0,
            });
        } catch (error) {
            console.error(error);
            messageApi.error("❌ Không thể tải dữ liệu sinh viên");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // === SEARCH ===
    const handleSearch = (value) => {
        setKeyword(value);
        fetchData(1, pagination.pageSize, value);
    };

    // === ADD ===
    const handleAdd = () => {
        setIsEdit(false);
        setEditingRecord(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    // === EDIT ===
    const handleEdit = (record) => {
        setIsEdit(true);
        setEditingRecord(record);
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    // === DELETE ===
    const handleDelete = async (id) => {
        try {
            await studentService.delete(id);
            messageApi.success("🗑️ Xóa sinh viên thành công!");
            await fetchData(pagination.current, pagination.pageSize, keyword);
        } catch (error) {
            console.error(error);
            messageApi.error(
                error?.response?.data?.message || "❌ Lỗi khi xóa sinh viên!"
            );
        }
    };

    // === SUBMIT ===
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            const payload = {
                code: values.code,
                fullName: values.fullName,
                email: values.email,
                phone: values.phone,
                departmentCode: values.departmentCode,
                classCode: values.classCode,
            };

            if (isEdit && editingRecord) {
                await studentService.update(editingRecord.id, payload);
                messageApi.success("✅ Cập nhật sinh viên thành công!");
            } else {
                await studentService.create(payload);
                messageApi.success("✅ Thêm sinh viên thành công!");
            }

            await fetchData(pagination.current, pagination.pageSize, keyword);
            form.resetFields();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);

            const apiErrors = error?.response?.data?.data;
            if (apiErrors && typeof apiErrors === "object") {
                const formErrors = Object.entries(apiErrors).map(([field, message]) => ({
                    name: field,
                    errors: [message],
                }));
                form.setFields(formErrors);
                messageApi.error("❌ Dữ liệu không hợp lệ!");
            } else {
                messageApi.error(error?.response?.data?.message || "❌ Lỗi khi lưu sinh viên!");
            }
        }
    };

    // === COLUMNS ===
    const columns = [
        { title: "ID", dataIndex: "id", width: 60 },
        { title: "Mã SV", dataIndex: "code" },
        { title: "Họ tên", dataIndex: "fullName" },
        { title: "Email", dataIndex: "email" },
        { title: "Điện thoại", dataIndex: "phone" },
        { title: "Mã ngành", dataIndex: "departmentCode" },
        { title: "Mã lớp", dataIndex: "classCode" },
        {
            title: "Hành động",
            width: 180,
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xác nhận xoá?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button danger type="link" icon={<DeleteOutlined />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {contextHolder}

            <Space
                style={{
                    marginBottom: 16,
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <Search
                    placeholder="Tìm kiếm sinh viên..."
                    allowClear
                    enterButton="Tìm kiếm"
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm sinh viên
                </Button>
            </Space>

            <Table
                rowKey="id"
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} sinh viên`,
                    onChange: (page, size) => fetchData(page, size, keyword),
                }}
            />

            <Modal
                title={isEdit ? "Cập nhật sinh viên" : "Thêm sinh viên"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="code" label="Mã sinh viên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="fullName" label="Tên sinh viên" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>

                    <Form.Item name="email" label="Email" rules={[{ required: true }]}>
                        <Input type="email" />
                    </Form.Item>

                    <Form.Item name="phone" label="Số điện thoại">
                        <Input />
                    </Form.Item>

                    <Form.Item name="departmentCode" label="Mã ngành">
                        <Input />
                    </Form.Item>

                    <Form.Item name="classCode" label="Mã lớp">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
