import React, { useEffect, useState, useCallback } from "react";
import {
    Button,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Space,
    Table,
    Select,
    Row,
    Col,
} from "antd";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { bookService } from "../api/bookService";
import { authorService } from "../api/authorService";
import { categoryService } from "../api/categoryService";
import { publisherService } from "../api/publisherService";

const { Search } = Input;
const { Option } = Select;

export default function BookPage() {
    const [messageApi, contextHolder] = message.useMessage();

    // === STATE CƠ BẢN ===
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

    // === STATE DROPDOWN ===
    const [authors, setAuthors] = useState([]);
    const [categories, setCategories] = useState([]);
    const [publishers, setPublishers] = useState([]);
    const [loadingAuthors, setLoadingAuthors] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingPublishers, setLoadingPublishers] = useState(false);

    // === DEBOUNCE SEARCH ===
    let debounceTimer = null;
    const debounce = (func, delay = 500) => {
        return (...args) => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func(...args), delay);
        };
    };

    // === API LOAD BOOKS ===
    const fetchData = async (page = 1, size = 10, searchValue = "") => {
        setLoading(true);
        try {
            const res = await bookService.search({
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
            messageApi.error("❌ Không thể tải dữ liệu sách");
        } finally {
            setLoading(false);
        }
    };

    // === API DROPDOWN SEARCH ===
    const searchAuthors = async (keyword = "") => {
        setLoadingAuthors(true);
        try {
            const res = await authorService.search({ page: 0, size: 10, search: keyword });
            setAuthors(res.content || []);
        } finally {
            setLoadingAuthors(false);
        }
    };

    const searchCategories = async (keyword = "") => {
        setLoadingCategories(true);
        try {
            const res = await categoryService.search({ page: 0, size: 10, search: keyword });
            setCategories(res.content || []);
        } finally {
            setLoadingCategories(false);
        }
    };

    const searchPublishers = async (keyword = "") => {
        setLoadingPublishers(true);
        try {
            const res = await publisherService.search({
                page: 0,
                size: 10,
                search: keyword,
            });
            setPublishers(res.content || []);
        } finally {
            setLoadingPublishers(false);
        }
    };

    // === LOAD DỮ LIỆU BAN ĐẦU ===
    useEffect(() => {
        fetchData();
        searchAuthors();
        searchCategories();
        searchPublishers();
    }, []);

    // === SEARCH BẢNG ===
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
        form.setFieldsValue(record);
        setIsModalOpen(true);
    };

    // === XOÁ ===
    const handleDelete = async (id) => {
        try {
            await bookService.delete(id);
            messageApi.success("🗑️ Xóa sách thành công!");
            await fetchData(pagination.current, pagination.pageSize, keyword);
        } catch (error) {
            console.error(error);
            messageApi.error(error?.response?.data?.message || "❌ Lỗi khi xóa sách!");
        }
    };

    // === SUBMIT FORM ===
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                title: values.title,
                isbn: values.isbn,
                publishYear: values.publishYear,
                language: values.language,
                quantity: Number(values.quantity),
                price: Number(values.price),
                description: values.description,
                coverImage: values.coverImage,
                publisherId: values.publisherId,
                categoryIds: values.categoryIds || [],
                authorIds: values.authorIds || [],
            };

            if (isEdit && editingRecord) {
                await bookService.update(editingRecord.id, payload);
                messageApi.success("✅ Cập nhật sách thành công!");
            } else {
                await bookService.create(payload);
                messageApi.success("✅ Thêm sách thành công!");
            }

            await fetchData(pagination.current, pagination.pageSize, keyword);
            form.resetFields();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            messageApi.error(error?.response?.data?.message || "❌ Lỗi khi lưu sách!");
        }
    };

    // === CỘT BẢNG ===
    const columns = [
        { title: "ID", dataIndex: "id", key: "id", width: 80 },
        { title: "Tên sách", dataIndex: "title", key: "title" },
        { title: "ISBN", dataIndex: "isbn", key: "isbn" },
        {
            title: "Năm XB",
            dataIndex: "publishYear",
            key: "publishYear",
            width: 100,
            align: "center",
        },
        { title: "Ngôn ngữ", dataIndex: "language", key: "language", width: 100 },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            align: "center",
        },
        {
            title: "Giá (VNĐ)",
            dataIndex: "price",
            key: "price",
            width: 120,
            align: "right",
            render: (price) => (price ? price.toLocaleString("vi-VN") : "—"),
        },
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
            {contextHolder}

            {/* THANH TÌM KIẾM + NÚT THÊM */}
            <Space
                style={{
                    marginBottom: 16,
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <Search
                    placeholder="Tìm kiếm sách..."
                    allowClear
                    enterButton="Tìm kiếm"
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Thêm sách
                </Button>
            </Space>

            {/* BẢNG DỮ LIỆU */}
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
                    showTotal: (total) => `Tổng ${total} sách`,
                    onChange: (page, pageSize) => fetchData(page, pageSize, keyword),
                }}
            />

            {/* MODAL THÊM/SỬA */}
            <Modal
                title={isEdit ? "Cập nhật sách" : "Thêm sách"}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText="Lưu"
                cancelText="Hủy"
                destroyOnClose
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    colon={false}
                    style={{ marginTop: 8 }}
                >
                    {/* === PHẦN 1: THÔNG TIN CƠ BẢN === */}
                    <h4 style={{ color: "#1677ff", marginBottom: 12 }}>🧾 Thông tin chung</h4>
                    <Row gutter={[16, 8]}>
                        <Col span={12}>
                            <Form.Item
                                name="title"
                                label="Tên sách"
                                rules={[{ required: true, message: "Nhập tên sách" }]}
                            >
                                <Input placeholder="Nhập tên sách..." />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item
                                name="isbn"
                                label="Mã ISBN"
                                rules={[{ required: true, message: "Nhập mã ISBN" }]}
                            >
                                <Input placeholder="Nhập mã ISBN..." />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="publishYear" label="Năm xuất bản">
                                <Input type="number" placeholder="VD: 2025" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="language" label="Ngôn ngữ">
                                <Input placeholder="VD: EN, VI..." />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="quantity" label="Số lượng">
                                <Input type="number" placeholder="VD: 10" />
                            </Form.Item>
                        </Col>

                        <Col span={8}>
                            <Form.Item name="price" label="Giá (VNĐ)">
                                <Input type="number" placeholder="VD: 150000" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* === PHẦN 2: DANH MỤC === */}
                    <h4 style={{ color: "#1677ff", marginTop: 16, marginBottom: 12 }}>
                        🏷️ Danh mục
                    </h4>
                    <Row gutter={[16, 8]}>
                        <Col span={12}>
                            <Form.Item name="publisherId" label="Nhà xuất bản">
                                <Select
                                    placeholder="Tìm nhà xuất bản..."
                                    allowClear
                                    showSearch
                                    loading={loadingPublishers}
                                    filterOption={false}
                                    onSearch={debounce(searchPublishers)}
                                >
                                    {publishers.map((p) => (
                                        <Select.Option key={p.id} value={p.id}>
                                            {p.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item name="categoryIds" label="Thể loại">
                                <Select
                                    mode="multiple"
                                    placeholder="Tìm thể loại..."
                                    allowClear
                                    showSearch
                                    loading={loadingCategories}
                                    filterOption={false}
                                    onSearch={debounce(searchCategories)}
                                >
                                    {categories.map((c) => (
                                        <Select.Option key={c.id} value={c.id}>
                                            {c.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item name="authorIds" label="Tác giả">
                                <Select
                                    mode="multiple"
                                    placeholder="Tìm tác giả..."
                                    allowClear
                                    showSearch
                                    loading={loadingAuthors}
                                    filterOption={false}
                                    onSearch={debounce(searchAuthors)}
                                >
                                    {authors.map((a) => (
                                        <Select.Option key={a.id} value={a.id}>
                                            {a.fullName || a.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item name="coverImage" label="Ảnh bìa (URL)">
                                <Input placeholder="https://..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* === PHẦN 3: MÔ TẢ === */}
                    <h4 style={{ color: "#1677ff", marginTop: 16, marginBottom: 12 }}>📝 Mô tả</h4>
                    <Form.Item name="description">
                        <Input.TextArea rows={4} placeholder="Nhập mô tả nội dung..." />
                    </Form.Item>
                </Form>

            </Modal>
        </div>
    );
}
