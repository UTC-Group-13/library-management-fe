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
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { publisherService } from "../api/publisherService";

const { Search } = Input;

export default function PublisherPage() {
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

  // === FETCH DATA ===
  const fetchData = async (page = 1, size = 10, searchValue = "") => {
    setLoading(true);
    try {
      const res = await publisherService.search({
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
      messageApi.error("❌ Không thể tải dữ liệu nhà xuất bản");
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
      await publisherService.delete(id);
      messageApi.success("🗑️ Xóa nhà xuất bản thành công!");
      await fetchData(pagination.current, pagination.pageSize, keyword);
    } catch (error) {
      console.error(error);
      messageApi.error("❌ Lỗi khi xóa nhà xuất bản!");
    }
  };

  // === SUBMIT FORM ===
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        description: values.description,
      };

      if (isEdit && editingRecord) {
        await publisherService.update(editingRecord.id, payload);
        messageApi.success("✅ Cập nhật nhà xuất bản thành công!");
      } else {
        await publisherService.create(payload);
        messageApi.success("✅ Thêm nhà xuất bản thành công!");
      }

      await fetchData(pagination.current, pagination.pageSize, keyword);
      setIsModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error(error);
      messageApi.error("❌ Lỗi khi lưu nhà xuất bản!");
    }
  };

  // === TABLE COLUMNS ===
  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 80 },
    { title: "Tên nhà xuất bản", dataIndex: "name", key: "name" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
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
      <Space
        style={{
          marginBottom: 16,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Search
          placeholder="Tìm kiếm nhà xuất bản..."
          allowClear
          enterButton="Tìm kiếm"
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm nhà xuất bản
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
          showTotal: (total) => `Tổng ${total} nhà xuất bản`,
          onChange: (page, pageSize) => fetchData(page, pageSize, keyword),
        }}
      />

      <Modal
        title={isEdit ? "Cập nhật nhà xuất bản" : "Thêm nhà xuất bản"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên nhà xuất bản"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Nhập tên nhà xuất bản" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả (địa chỉ...)" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
