import React, { useEffect, useState } from "react";
import { Button, DatePicker, Form, Input, message, Modal, Popconfirm, Space, Table, } from "antd";
import { categoryService } from "../api/categoryService";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Search } = Input;

export default function CategoryPage() {
    const [messageApi, contextHolder] = message.useMessage(); // ✅ Tạo instance message

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

    // === GỌI API PHÂN TRANG ===
    const fetchData = async (page = 1, size = 10, searchValue = "") => {
        setLoading(true);
        try {
            const res = await categoryService.search({
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
            messageApi.error("❌ Không thể tải dữ liệu danh mục");
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

    // === THÊM MỚI ===
    const handleAdd = () => {
        setIsEdit(false);
        setEditingRecord(null);
        form.resetFields();
        setIsModalOpen(true);
    };

    // === SỬA ===
    const handleEdit = (record) => {
        setIsEdit(true);
        setEditingRecord(record);
        form.setFieldsValue({
            ...record,
            birthDate: record.birthDate ? dayjs(record.birthDate) : null,
        });
        setIsModalOpen(true);
    };

    // === XOÁ ===
    const handleDelete = async (id) => {
        try {
            await categoryService.delete(id);
            messageApi.success("🗑️ Xóa danh mục thành công!");
            await fetchData(pagination.current, pagination.pageSize, keyword);
        } catch (error) {
            console.error(error);
            messageApi.error(
                error?.response?.data?.message || "❌ Lỗi khi xóa danh mục!"
            );
        }
    };

    // === SUBMIT FORM (THÊM HOẶC CẬP NHẬT) ===
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                name: values.name,
                birthDate: values.birthDate?.format("YYYY-MM-DD"),
                nationality: values.nationality,
                biography: values.biography,
                email: values.email,
            };

            if (isEdit && editingRecord) {
                await categoryService.update(editingRecord.id, payload);
                messageApi.success("✅ Cập nhật danh mục thành công!");
            } else {
                await categoryService.create(payload);
                messageApi.success("✅ Thêm danh mục thành công!");
            }

            await fetchData(pagination.current, pagination.pageSize, keyword);
            form.resetFields();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            messageApi.error(
                error?.response?.data?.message || "❌ Lỗi khi lưu danh mục!"
            );
        }
    };

    // === CỘT BẢNG ===
    const columns = [
        { title: "ID", dataIndex: "id", key: "id", width: 80 },
        { title: "Tên danh mục", dataIndex: "name", key: "name" },
        {
            title: "Hành động",
            key: "action",
            width: 180,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    >
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
            {contextHolder} {/* ✅ Bắt buộc có dòng này */}
            <Space
                style={{
                    marginBottom: 16,
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <Search
                    placeholder="Tìm kiếm danh mục..."
                    allowClear
                    enterButton="Tìm kiếm"
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm danh mục
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
                    showTotal: (total) => `Tổng ${total} danh mục`,
                    onChange: (page, pageSize) =>
                        fetchData(page, pageSize, keyword),
                }}
            />

            <Modal
                title={isEdit ? "Cập nhật danh mục" : "Thêm danh mục"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose={true}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="name"
                        label="Tên danh mục"
                        rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
