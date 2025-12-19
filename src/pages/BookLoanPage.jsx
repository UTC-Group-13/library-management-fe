import React, {useEffect, useState} from "react";
import {Button, Col, DatePicker, Form, Input, message, Modal, Popconfirm, Row, Select, Space, Table, Tag,} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined,} from "@ant-design/icons";
import dayjs from "dayjs";
import {bookLoanService} from "../api/bookLoanService";
import {bookService} from "../api/bookService";
import {studentService} from "../api/studentService";

const {Search} = Input;
const {Option} = Select;

const STATUS_OPTIONS = [
    {value: "BORROWING", label: "Đang mượn"},
    {value: "RETURNED", label: "Đã trả"},
    {value: "LATE", label: "Trễ hạn"},
];

const statusTag = (status) => {
    const map = {
        BORROWING: {color: "blue", text: "Đang mượn"},
        RETURNED: {color: "green", text: "Đã trả"},
        LATE: {color: "red", text: "Trễ hạn"},
    };
    const s = map[status] || {color: "default", text: status || "-"};
    return <Tag color={s.color}>{s.text}</Tag>;
};

export default function BookLoanPage() {
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
    const [students, setStudents] = useState([]);
    const [books, setBooks] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [loadingBooks, setLoadingBooks] = useState(false);

    // === DEBOUNCE SEARCH ===
    let debounceTimer = null;
    const debounce = (func, delay = 500) => {
        return (...args) => {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func(...args), delay);
        };
    };

    // === API LOAD LOANS ===
    const fetchData = async (page = 1, size = 10, searchValue = "") => {
        setLoading(true);
        try {
            const res = await bookLoanService.search({
                page: page - 1,
                size,
                search: searchValue || "",
                sortBy: "id",
                sortDir: "desc",
            });

            setData(res.content || []);
            setPagination({
                current: (res.pageable?.pageNumber || 0) + 1,
                pageSize: res.pageable?.pageSize || size,
                total: res.totalElements || 0,
            });
        } catch (error) {
            console.error(error);
            messageApi.error("❌ Không thể tải dữ liệu phiếu mượn");
        } finally {
            setLoading(false);
        }
    };

    // === API DROPDOWN SEARCH ===
    const searchStudents = async (kw = "") => {
        setLoadingStudents(true);
        try {
            const res = await studentService.search({page: 0, size: 10, search: kw});
            setStudents(res.content || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingStudents(false);
        }
    };

    const searchBooks = async (kw = "") => {
        setLoadingBooks(true);
        try {
            const res = await bookService.search({page: 0, size: 10, search: kw});
            setBooks(res.content || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingBooks(false);
        }
    };

    // === LOAD DỮ LIỆU BAN ĐẦU ===
    useEffect(() => {
        fetchData();
        searchStudents();
        searchBooks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // === SEARCH BẢNG ===
    const handleSearchChange = (e) => {
        const v = e.target.value;
        setKeyword(v);
        debounce(() => fetchData(1, pagination.pageSize, v))();
    };

    const handleSearch = (value) => {
        setKeyword(value || "");
        fetchData(1, pagination.pageSize, value || "");
    };

    // === TABLE COLUMNS ===
    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            width: 80,
        },
        {
            title: "Sinh viên",
            dataIndex: ["student", "fullName"],
            render: (_, record) =>
                record?.student?.fullName ||
                record?.student?.name ||
                `SV #${record?.student?.id || "-"}`,
        },
        {
            title: "Sách",
            dataIndex: ["book", "title"],
            render: (_, record) => record?.book?.title || `Sách #${record?.book?.id || "-"}`,
        },
        {
            title: "Ngày mượn",
            dataIndex: "borrowDate",
            render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "-"),
        },
        {
            title: "Hạn trả",
            dataIndex: "dueDate",
            render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "-"),
        },
        {
            title: "Ngày trả",
            dataIndex: "returnDate",
            render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "-"),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            render: (status) => statusTag(status),
            filters: STATUS_OPTIONS.map((s) => ({text: s.label, value: s.value})),
            onFilter: (value, record) => record?.status === value,
        },
        {
            title: "Thao tác",
            key: "actions",
            width: 140,
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined/>}
                        onClick={() => openEditModal(record)}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Xóa phiếu mượn?"
                        description="Thao tác này không thể hoàn tác"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => handleDelete(record)}
                    >
                        <Button type="link" danger icon={<DeleteOutlined/>}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // === HANDLERS MODAL ===
    const openCreateModal = () => {
        setIsEdit(false);
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({
            status: "BORROWING",
            borrowDate: dayjs(),
        });
        setIsModalOpen(true);
    };

    const openEditModal = (record) => {
        console.log(record, "record edit modal")
        setIsEdit(true);
        setEditingRecord(record || null);
        form.resetFields();
        form.setFieldsValue({
            studentId: record?.student?.id,
            bookId: record?.book?.id,
            borrowDate: record?.borrowDate ? dayjs(record.borrowDate) : null,
            dueDate: record?.dueDate ? dayjs(record.dueDate) : null,
            returnDate: record?.returnDate ? dayjs(record.returnDate) : null,
            status: record?.status || "BORROWING",
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const payload = {
                studentId: values.studentId,
                bookId: values.bookId,
                borrowDate: values.borrowDate ? values.borrowDate.toISOString() : null,
                dueDate: values.dueDate ? values.dueDate.toISOString() : null,
                returnDate: values.returnDate ? values.returnDate.toISOString() : null,
                status: values.status,
            };

            if (isEdit && editingRecord?.id) {
                await bookLoanService.update(editingRecord.id, payload);
                messageApi.success("✅ Cập nhật phiếu mượn thành công");
            } else {
                await bookLoanService.create(payload);
                messageApi.success("✅ Tạo phiếu mượn thành công");
            }

            setIsModalOpen(false);
            await fetchData(pagination.current, pagination.pageSize, keyword);
        } catch (error) {
            if (error?.errorFields) return; // validate fail
            console.error(error);
            messageApi.error("❌ Lưu phiếu mượn thất bại");
        }
    };

    const handleDelete = async (record) => {
        try {
            await bookLoanService.remove(record?.id);
            messageApi.success("✅ Đã xóa phiếu mượn");
            await fetchData(pagination.current, pagination.pageSize, keyword);
        } catch (e) {
            console.error(e);
            messageApi.error("❌ Xóa phiếu mượn thất bại");
        }
    };

    const handleTableChange = (pag) => {
        setPagination((prev) => ({...prev, current: pag.current, pageSize: pag.pageSize}));
        fetchData(pag.current, pag.pageSize, keyword);
    };

    const statusValue = Form.useWatch("status", form);

    return (
        <>
            {contextHolder}

            <Row gutter={[16, 16]} style={{marginBottom: 16}}>
                <Col xs={24} sm={12} md={14}>
                    <Search
                        placeholder="Tìm kiếm phiếu mượn..."
                        allowClear
                        value={keyword}
                        onChange={handleSearchChange}
                        onSearch={handleSearch}
                        enterButton
                    />
                </Col>
                <Col xs={24} sm={12} md={10} style={{textAlign: "right"}}>
                    <Space wrap>
                        <Button type="primary" icon={<PlusOutlined/>} onClick={openCreateModal}>
                            Thêm phiếu mượn
                        </Button>
                    </Space>
                </Col>
            </Row>

            <Table
                rowKey="id"
                loading={loading}
                columns={columns}
                dataSource={data}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    showTotal: (t) => `Tổng ${t} bản ghi`,
                }}
                onChange={handleTableChange}
            />

            <Modal
                open={isModalOpen}
                title={isEdit ? "Cập nhật phiếu mượn" : "Thêm phiếu mượn"}
                onCancel={() => setIsModalOpen(false)}
                onOk={handleSubmit}
                okText={isEdit ? "Lưu" : "Tạo mới"}
                cancelText="Hủy"
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Sinh viên"
                        name="studentId"
                        rules={[{required: true, message: "Vui lòng chọn sinh viên"}]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn sinh viên"
                            loading={loadingStudents}
                            filterOption={false}
                            onSearch={(v) => searchStudents(v)}
                            onDropdownVisibleChange={(open) => open && searchStudents("")}
                            allowClear
                        >
                            {(students || []).map((s) => (
                                <Option key={s.id} value={s.id}>
                                    {s.fullName || s.name || `Sinh viên #${s.id}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Sách"
                        name="bookId"
                        rules={[{required: true, message: "Vui lòng chọn sách"}]}
                    >
                        <Select
                            showSearch
                            placeholder="Chọn sách"
                            loading={loadingBooks}
                            filterOption={false}
                            onSearch={(v) => searchBooks(v)}
                            onDropdownVisibleChange={(open) => open && searchBooks("")}
                            allowClear
                        >
                            {(books || []).map((b) => (
                                <Option key={b.id} value={b.id}>
                                    {b.title || `Sách #${b.id}`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Ngày mượn"
                        name="borrowDate"
                        rules={[{required: true, message: "Vui lòng chọn ngày mượn"}]}
                    >
                        <DatePicker format="DD/MM/YYYY" className="w-100"/>
                    </Form.Item>

                    <Form.Item
                        label="Hạn trả"
                        name="dueDate"
                        rules={[{required: true, message: "Vui lòng chọn hạn trả"}]}
                    >
                        <DatePicker format="DD/MM/YYYY" className="w-100"/>
                    </Form.Item>

                    {isEdit && (
                        <Form.Item
                            label="Trạng thái"
                            name="status"
                            rules={[{required: true, message: "Vui lòng chọn trạng thái"}]}
                        >
                            <Select placeholder="Chọn trạng thái">
                                {STATUS_OPTIONS.map((s) => (
                                    <Option key={s.value} value={s.value}>
                                        {s.label}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    )}

                    {isEdit && (<Form.Item label="Ngày trả" name="returnDate">
                        <DatePicker
                            format="DD/MM/YYYY"
                            className="w-100"
                            disabled={statusValue !== "RETURNED"}
                            placeholder={statusValue === "RETURNED" ? "Chọn ngày trả" : "Chỉ nhập khi trạng thái là 'Đã trả'"}
                        />
                    </Form.Item>)}
                </Form>
            </Modal>
        </>
    );
}