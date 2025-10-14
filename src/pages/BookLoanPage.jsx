import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { bookLoanService } from "../api/bookLoanService";
import { bookService } from "../api/bookService";
import { studentService } from "../api/studentService";

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

const formatDate = (val) =>
  val ? dayjs(val).format("YYYY-MM-DD") : "";

export default function BookLoanPage() {
  const [messageApi, contextHolder] = message.useMessage();

  // === Table state ===
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ keyword: "" });

  // === Modal state ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form] = Form.useForm();

  // === Dropdown data ===
  const [bookOptions, setBookOptions] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // ================== API ==================
  const fetchData = async (page = 1, size = 10, keyword = "") => {
    setLoading(true);
    try {
      const res = await bookLoanService.search({
        page: page - 1,
        size,
        keyword,
      });
      const content = res?.content ?? [];
      setData(content);
      setPagination({
        current: res?.pageable?.pageNumber + 1 || 1,
        pageSize: res?.pageable?.pageSize || 10,
        total: res?.totalElements || 0,
      });
    } catch {
      messageApi.error("Không tải được danh sách mượn trả");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange = (pag) => {
    fetchData(pag.current, pag.pageSize, filters.keyword);
  };

  const onSearchKeyword = (value) => {
    setFilters({ keyword: value });
    fetchData(1, pagination.pageSize, value);
  };

  // === Search dropdown dynamic ===
  const debounce = useCallback((fn, delay = 500) => {
    let timer;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }, []);

  const searchBooks = async (keyword = "") => {
    setLoadingBooks(true);
    try {
      const res = await bookService.search({ page: 0, size: 10, keyword });
      const opts = (res.content || []).map((b) => ({
        value: b.id,
        label: b.title,
      }));
      setBookOptions(opts);
    } finally {
      setLoadingBooks(false);
    }
  };

  const searchStudents = async (keyword = "") => {
    setLoadingStudents(true);
    try {
      const res = await studentService.search({ page: 0, size: 10, keyword });
      const opts = (res.content || []).map((s) => ({
        value: s.id,
        label: `${s.studentCode || ""} - ${s.fullName || s.name || ""}`,
      }));
      setStudentOptions(opts);
    } finally {
      setLoadingStudents(false);
    }
  };

  const debouncedSearchBooks = useMemo(() => debounce(searchBooks), [debounce]);
  const debouncedSearchStudents = useMemo(() => debounce(searchStudents), [debounce]);

  // === Modal handlers ===
  const openCreate = async () => {
    setIsEdit(false);
    setEditingRecord(null);
    form.resetFields();
    await Promise.all([searchBooks(), searchStudents()]);
    setIsModalOpen(true);
  };

  const openEdit = async (record) => {
    setIsEdit(true);
    setEditingRecord(record);
    await Promise.all([searchBooks(), searchStudents()]);
    form.setFieldsValue({
      studentId: record.studentId,
      bookId: record.bookId,
      borrowDate: record.borrowDate ? dayjs(record.borrowDate) : null,
      dueDate: record.dueDate ? dayjs(record.dueDate) : null,
      fee: record.fee || 0,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    form.resetFields();
    setIsModalOpen(false);
    setEditingRecord(null);
    setIsEdit(false);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (
        values.dueDate &&
        values.borrowDate &&
        values.dueDate.isBefore(values.borrowDate, "day")
      ) {
        messageApi.error("Ngày đến hạn phải sau ngày mượn");
        return;
      }

      const payload = {
        studentId: values.studentId,
        bookId: values.bookId,
        borrowDate: values.borrowDate.format("YYYY-MM-DD"),
        dueDate: values.dueDate.format("YYYY-MM-DD"),
        fee: values.fee ?? 0,
      };

      if (isEdit) {
        await bookLoanService.update(editingRecord.id, payload);
        messageApi.success("Cập nhật phiếu mượn thành công");
      } else {
        await bookLoanService.create(payload);
        messageApi.success("Tạo phiếu mượn thành công");
      }

      closeModal();
      fetchData(pagination.current, pagination.pageSize);
    } catch (e) {
      messageApi.error(e?.response?.data?.message || "Lỗi khi lưu phiếu mượn");
    }
  };

  const handleDelete = async (record) => {
    try {
      await bookLoanService.remove(record.id);
      messageApi.success("Xóa phiếu mượn thành công");
      fetchData(pagination.current, pagination.pageSize);
    } catch {
      messageApi.error("Xóa thất bại");
    }
  };

  // === Table columns ===
  const columns = useMemo(
    () => [
      { title: "Mã", dataIndex: "id", width: 80 },
      {
        title: "Sinh viên",
        dataIndex: "studentName",
        render: (_, r) =>
          r.studentName || r.student?.fullName || r.student?.name || "-",
      },
      {
        title: "Sách",
        dataIndex: "bookTitle",
        render: (_, r) => r.bookTitle || r.book?.title || "-",
      },
      { title: "Ngày mượn", dataIndex: "borrowDate", render: formatDate },
      { title: "Ngày đến hạn", dataIndex: "dueDate", render: formatDate },
      {
        title: "Phí (VNĐ)",
        dataIndex: "fee",
        render: (v) => (v ? v.toLocaleString("vi-VN") : "0"),
        align: "right",
      },
      { title: "Trạng thái", dataIndex: "status", render: statusTag },
      {
        title: "Thao tác",
        key: "actions",
        width: 160,
        render: (_, record) => (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => openEdit(record)}
            >
              Sửa
            </Button>
            <Popconfirm
              title="Xóa phiếu mượn này?"
              onConfirm={() => handleDelete(record)}
            >
              <Button size="small" danger icon={<DeleteOutlined />}>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    []
  );

  // ================== RENDER ==================
  return (
    <div>
      {contextHolder}

      {/* HEADER ACTIONS */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Search
          placeholder="Tìm kiếm theo từ khóa"
          allowClear
          onSearch={onSearchKeyword}
          style={{ width: 320 }}
        />
        <Button icon={<ReloadOutlined />} onClick={() => fetchData()}>
          Làm mới
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
          Thêm mới
        </Button>
      </Space>

      {/* TABLE */}
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
      />

      {/* MODAL FORM */}
      <Modal
        title={isEdit ? "Cập nhật phiếu mượn" : "Thêm phiếu mượn"}
        open={isModalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={isEdit ? "Lưu" : "Tạo mới"}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ fee: 0 }}
          style={{ marginTop: 8 }}
        >
          <Row gutter={[16, 8]}>
            <Col span={12}>
              <Form.Item
                label="Sinh viên"
                name="studentId"
                rules={[{ required: true, message: "Vui lòng chọn sinh viên" }]}
              >
                <Select
                  showSearch
                  placeholder="Tìm sinh viên..."
                  allowClear
                  loading={loadingStudents}
                  filterOption={false}
                  onSearch={debouncedSearchStudents}
                  options={studentOptions}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Sách"
                name="bookId"
                rules={[{ required: true, message: "Vui lòng chọn sách" }]}
              >
                <Select
                  showSearch
                  placeholder="Tìm sách..."
                  allowClear
                  loading={loadingBooks}
                  filterOption={false}
                  onSearch={debouncedSearchBooks}
                  options={bookOptions}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Ngày mượn"
                name="borrowDate"
                rules={[{ required: true, message: "Chọn ngày mượn" }]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Ngày đến hạn"
                name="dueDate"
                rules={[{ required: true, message: "Chọn ngày đến hạn" }]}
              >
                <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Phí (VNĐ)" name="fee">
                <InputNumber style={{ width: "100%" }} min={0} step={1000} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
