import React, { useEffect, useState } from "react";
import { Button, DatePicker, Form, Input, message, Modal, Popconfirm, Space, Table, } from "antd";
import { authorService } from "../api/authorService";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Search } = Input;

export default function BookPage() {
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
            const res = await authorService.search({
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
            messageApi.error("❌ Không thể tải dữ liệu tác giả");
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
            await authorService.delete(id);
            messageApi.success("🗑️ Xóa tác giả thành công!");
            await fetchData(pagination.current, pagination.pageSize, keyword);
        } catch (error) {
            console.error(error);
            messageApi.error(
                error?.response?.data?.message || "❌ Lỗi khi xóa tác giả!"
            );
        }
    };

    // === SUBMIT FORM (THÊM HOẶC CẬP NHẬT) ===
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                fullName: values.fullName,
                birthDate: values.birthDate?.format("YYYY-MM-DD"),
                nationality: values.nationality,
                biography: values.biography,
                email: values.email,
            };

            if (isEdit && editingRecord) {
                await authorService.update(editingRecord.id, payload);
                messageApi.success("✅ Cập nhật tác giả thành công!");
            } else {
                await authorService.create(payload);
                messageApi.success("✅ Thêm tác giả thành công!");
            }

            await fetchData(pagination.current, pagination.pageSize, keyword);
            form.resetFields();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            messageApi.error(
                error?.response?.data?.message || "❌ Lỗi khi lưu tác giả!"
            );
        }
    };

    // === CỘT BẢNG ===
    const columns = [
        { title: "ID", dataIndex: "id", key: "id", width: 80 },
        { title: "Họ và tên", dataIndex: "fullName", key: "fullName" },
        { title: "Email", dataIndex: "email", key: "email" },
        { title: "Quốc tịch", dataIndex: "nationality", key: "nationality" },
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
                    placeholder="Tìm kiếm tác giả..."
                    allowClear
                    enterButton="Tìm kiếm"
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm tác giả
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
                    showTotal: (total) => `Tổng ${total} tác giả`,
                    onChange: (page, pageSize) =>
                        fetchData(page, pageSize, keyword),
                }}
            />

            <Modal
                title={isEdit ? "Cập nhật tác giả" : "Thêm tác giả"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose={true}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="fullName"
                        label="Tên tác giả"
                        rules={[{ required: true, message: "Vui lòng nhập tên" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="birthDate"
                        label="Ngày sinh"
                        rules={[{ required: true, message: "Chọn ngày sinh" }]}
                    >
                        <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item name="nationality" label="Quốc tịch">
                        <Input />
                    </Form.Item>
                    <Form.Item name="biography" label="Tiểu sử">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item name="email" label="Email">
                        <Input type="email" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
