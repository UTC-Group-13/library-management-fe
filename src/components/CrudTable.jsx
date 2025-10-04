import React, { useEffect, useState, useMemo } from "react";
import { Button, Input, Space, Table, Modal, Form, notification, Popconfirm } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

export default function CrudTable({ title, columns, api }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState("");
    const [form] = Form.useForm();

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.getAll();
            setData(res);
        } catch (e) {
            notification.error({ message: "Lỗi tải dữ liệu", description: e.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSave = async (values) => {
        try {
            if (editing) {
                await api.update(editing.id, values);
                notification.success({ message: "Đã cập nhật thành công" });
            } else {
                await api.create(values);
                notification.success({ message: "Đã thêm mới thành công" });
            }
            setModalVisible(false);
            setEditing(null);
            fetchData();
        } catch (e) {
            notification.error({ message: "Lỗi lưu dữ liệu", description: e.message });
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.remove(id);
            notification.success({ message: "Đã xoá thành công" });
            fetchData();
        } catch (e) {
            notification.error({ message: "Lỗi xoá", description: e.message });
        }
    };

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return data;
        return data.filter((row) =>
            Object.values(row).some((v) => String(v).toLowerCase().includes(q))
        );
    }, [data, search]);

    const columnsWithActions = [
        ...columns,
        {
            title: "Thao tác",
            key: "actions",
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => {
                            setEditing(record);
                            form.setFieldsValue(record);
                            setModalVisible(true);
                        }}
                    />
                    <Popconfirm title="Xoá?" onConfirm={() => handleDelete(record.id)}>
                        <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
                <Input.Search
                    placeholder={`Tìm kiếm ${title.toLowerCase()}...`}
                    allowClear
                    style={{ width: 300 }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        setEditing(null);
                        form.resetFields();
                        setModalVisible(true);
                    }}
                >
                    Thêm
                </Button>
            </Space>

            <Table
                rowKey="id"
                dataSource={filtered}
                columns={columnsWithActions}
                loading={loading}
                pagination={{ pageSize: 8 }}
            />

            <Modal
                title={editing ? `Sửa ${title}` : `Thêm ${title}`}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    {columns.map((c) => (
                        <Form.Item
                            key={c.dataIndex}
                            name={c.dataIndex}
                            label={c.title}
                            rules={[{ required: true, message: `Nhập ${c.title.toLowerCase()}` }]}
                        >
                            <Input />
                        </Form.Item>
                    ))}
                    <Form.Item style={{ textAlign: "right" }}>
                        <Button onClick={() => setModalVisible(false)} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Lưu
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}