// src/pages/BookLoanPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Button,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tag,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { bookLoanService } from "../api/bookLoanService";
import { bookService } from "../api/bookService";
import { studentService } from "../api/studentService"; // giả định đã tồn tại tương tự bookService

const { Search } = Input;

const STATUS_OPTIONS = [
    { value: "BORROWED", label: "Đang mượn" },
    { value: "RETURNED", label: "Đã trả" },
    { value: "LATE", label: "Trễ hạn" },
];

const statusTag = (status) => {
    const map = {
        BORROWED: { color: "blue", text: "Đang mượn" },
        RETURNED: { color: "green", text: "Đã trả" },
        LATE: { color: "red", text: "Trễ hạn" },
    };
    const s = map[status] || { color: "default", text: status || "-" };
    return <Tag color={s.color}>{s.text}</Tag>;
};

const formatDate = (val, withTime = false) => {
    if (!val) return "";
    return withTime ? dayjs(val).format("YYYY-MM-DD HH:mm") : dayjs(val).format("YYYY-MM-DD");
};

export default function BookLoanPage() {
    const [messageApi, contextHolder] = message.useMessage();

    // Table data & pagination
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

    // Search/filter
    const [filters, setFilters] = useState({
        keyword: "",
        // có thể bổ sung các filter khác nếu backend hỗ trợ (status, studentId,...)
    });

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    // Select options for create/edit
    const [bookOptions, setBookOptions] = useState([]);
    const [studentOptions, setStudentOptions] = useState([]);
    const [loadingBooks, setLoadingBooks] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Fetch loans with GET /book-loans/search?page=&size=&keyword=
    const fetchData = async (page = 1, size = 10, extra = {}) => {
        setLoading(true);
        try {
            const res = await bookLoanService.search({
                page: page - 1,
                size,
                keyword: filters.keyword,
                ...extra,
            });
            const content = res?.content ?? res?.items ?? [];
            const total = res?.totalElements ?? res?.total ?? 0;
            const number = res?.number ?? (page - 1);
            setData(content);
            setPagination({
                current: number + 1,
                pageSize: size,
                total,
            });
        } catch (e) {
            messageApi.error("Không tải được danh sách mượn trả");
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (pag) => {
        fetchData(pag.current, pag.pageSize);
    };

    useEffect(() => {
        fetchData(1, pagination.pageSize);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSearchKeyword = (value) => {
        setFilters((prev) => ({ ...prev, keyword: value?.trim() || "" }));
        fetchData(1, pagination.pageSize, { keyword: value?.trim() || "" });
    };

    // Load books and students for Select (client-side search)
    const loadBooks = async () => {
        setLoadingBooks(true);
        try {
            const list = await bookService.getAll();
            const opts = (list || []).map((b) => ({
                value: b.id,
                label: [b.code, b.title].filter(Boolean).join(" - "),
            }));
            setBookOptions(opts);
        } catch (e) {
            messageApi.error("Không tải được danh sách sách");
        } finally {
            setLoadingBooks(false);
        }
    };

    const loadStudents = async () => {
        setLoadingStudents(true);
        try {
            const list = await studentService.getAll();
            const opts = (list || []).map((s) => ({
                value: s.id,
                label: [s.studentCode, s.fullName || s.name].filter(Boolean).join(" - "),
            }));
            setStudentOptions(opts);
        } catch (e) {
            messageApi.error("Không tải được danh sách sinh viên");
        } finally {
            setLoadingStudents(false);
        }
    };

    const openCreate = async () => {
        setIsEdit(false);
        setEditingRecord(null);
        form.resetFields();
        await Promise.all([loadBooks(), loadStudents()]);
        setIsModalOpen(true);
    };

    const openEdit = async (record) => {
        setIsEdit(true);
        setEditingRecord(record);
        await Promise.all([loadBooks(), loadStudents()]);
        form.setFieldsValue({
            studentId: record?.studentId,
            bookId: record?.bookId,
            borrowDate: record?.borrowDate ? dayjs(record.borrowDate) : null,
            dueDate: record?.dueDate ? dayjs(record.dueDate) : null,
            fee: record?.fee ?? 0,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRecord(null);
        setIsEdit(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            // Validate quan hệ ngày
            if (values.dueDate && values.borrowDate && values.dueDate.isBefore(values.borrowDate, "day")) {
                messageApi.error("Ngày đến hạn phải sau hoặc cùng ngày mượn");
                return;
            }

            const payload = {
                studentId: values.studentId,
                bookId: values.bookId,
                borrowDate: values.borrowDate ? values.borrowDate.format("YYYY-MM-DD") : null,
                dueDate: values.dueDate ? values.dueDate.format("YYYY-MM-DD") : null,
                fee: values.fee ?? 0,
            };

            if (!isEdit) {
                await bookLoanService.create(payload);
                messageApi.success("Tạo phiếu mượn thành công");
            } else {
                await bookLoanService.update(editingRecord.id, payload);
                messageApi.success("Cập nhật phiếu mượn thành công");
            }

            closeModal();
            fetchData(pagination.current, pagination.pageSize);
        } catch (e) {
            // antd form đã hiển thị lỗi validate; chỉ catch lỗi API
            if (e?.response?.data?.message) {
                messageApi.error(e.response.data.message);
            } else if (e?.message) {
                messageApi.error(e.message);
            }
        }
    };

    const handleDelete = async (record) => {
        try {
            await bookLoanService.remove(record.id);
            messageApi.success("Xóa phiếu mượn thành công");
            fetchData(pagination.current, pagination.pageSize);
        } catch (e) {
            messageApi.error("Xóa thất bại");
        }
    };

    const columns = useMemo(
        () => [
            {
                title: "Mã",
                dataIndex: "id",
                width: 80,
            },
            {
                title: "Sinh viên",
                dataIndex: "studentName",
                render: (_, r) => r.studentName || r.student?.fullName || r.student?.name || "-",
            },
            {
                title: "Sách",
                dataIndex: "bookTitle",
                render: (_, r) => r.bookTitle || r.book?.title || "-",
            },
            {
                title: "Ngày mượn",
                dataIndex: "borrowDate",
                render: (v) => formatDate(v),
            },
            {
                title: "Ngày đến hạn",
                dataIndex: "dueDate",
                render: (v) => formatDate(v),
            },
            {
                title: "Phí",
                dataIndex: "fee",
                render: (v) => (v != null ? Number(v) : 0),
            },
            {
                title: "Trạng thái",
                dataIndex: "status",
                render: (v) => statusTag(v),
            },
            {
                title: "Thao tác",
                key: "actions",
                width: 160,
                render: (_, record) => (
                    <Space>
                        <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)}>
                            Sửa
                        </Button>
                        <Popconfirm title="Xóa phiếu mượn này?" onConfirm={() => handleDelete(record)}>
                            <Button size="small" danger icon={<DeleteOutlined />}>
                                Xóa
                            </Button>
                        </Popconfirm>
                    </Space>
                ),
            },
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <div>
            {contextHolder}
            <Space style={{ marginBottom: 16 }} wrap>
                <Search
                    placeholder="Tìm kiếm theo từ khóa"
                    allowClear
                    onSearch={onSearchKeyword}
                    style={{ width: 320 }}
                />
                <Button icon={<ReloadOutlined />} onClick={() => fetchData(1, pagination.pageSize)}>
                    Làm mới
                </Button>
                <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                    Thêm mới
                </Button>
            </Space>

            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={pagination}
                onChange={handleTableChange}
            />

            <Modal
                title={isEdit ? "Cập nhật phiếu mượn" : "Thêm phiếu mượn"}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={handleSubmit}
                okText={isEdit ? "Lưu" : "Tạo mới"}
                confirmLoading={loadingBooks || loadingStudents}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        fee: 0,
                    }}
                >
                    <Form.Item
                        label="Sinh viên"
                        name="studentId"
                        rules={[{ required: true, message: "Vui lòng chọn sinh viên" }]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn sinh viên"
                            loading={loadingStudents}
                            options={studentOptions}
                            optionFilterProp="label"
                            filterSort={(a, b) => a.label.localeCompare(b.label)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Sách"
                        name="bookId"
                        rules={[{ required: true, message: "Vui lòng chọn sách" }]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn sách"
                            loading={loadingBooks}
                            options={bookOptions}
                            optionFilterProp="label"
                            filterSort={(a, b) => a.label.localeCompare(b.label)}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Ngày mượn"
                        name="borrowDate"
                        rules={[{ required: true, message: "Vui lòng chọn ngày mượn" }]}
                    >
                        <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item
                        label="Ngày đến hạn"
                        name="dueDate"
                        rules={[{ required: true, message: "Vui lòng chọn ngày đến hạn" }]}
                    >
                        <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                    </Form.Item>

                    <Form.Item label="Phí" name="fee">
                        <InputNumber style={{ width: "100%" }} min={0} step={1000} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}