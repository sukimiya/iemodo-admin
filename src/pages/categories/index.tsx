import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Input, InputNumber,
  message, Typography, Popconfirm, Tag, Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Category } from '../../api/categories';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
} from '../../api/categories';

const { Title } = Typography;

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    getCategories().then(res => {
      const data = res.data?.data || res.data || [];
      setCategories(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ level: 1, sortOrder: 0, isActive: true });
    setModalOpen(true);
  };

  const handleEdit = (record: Category) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      message.success('分类已删除');
      fetchData();
    } catch { message.error('删除失败'); }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await updateCategory(editing.id, values);
        message.success('分类已更新');
      } else {
        await createCategory(values);
        message.success('分类已创建');
      }
      setModalOpen(false);
      fetchData();
    } catch { /* validation error */ } finally { setSaving(false); }
  };

  const rootCategories = categories.filter(c => !c.parentId);

  const getChildren = (parentId: number) => categories.filter(c => c.parentId === parentId);

  const levelColors = ['blue', 'green', 'orange'];

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 100 },
    {
      title: '名称', dataIndex: 'name',
      render: (_: unknown, record: Category) => (
        <span>
          {'  '.repeat(Math.max(0, record.level - 1))}
          {record.name}
        </span>
      ),
    },
    {
      title: '层级', dataIndex: 'level', width: 80,
      render: (v: number) => <Tag color={levelColors[v - 1] || 'default'}>L{v}</Tag>,
    },
    {
      title: '排序', dataIndex: 'sortOrder', width: 80,
    },
    {
      title: '状态', dataIndex: 'isActive', width: 80,
      render: (v: boolean) => v ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>,
    },
    {
      title: '父分类', dataIndex: 'parentId', width: 120,
      render: (id: number | null) => id ? (categories.find(c => c.id === id)?.name || `#${id}`) : <Tag>-</Tag>,
    },
    {
      title: '操作', width: 140,
      render: (_: unknown, record: Category) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>商品分类</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建分类</Button>
      </div>
      <Card>
        <Table
          dataSource={categories}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="small"
        />
      </Card>
      <Modal
        title={editing ? '编辑分类' : '新建分类'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="parentId" label="父分类">
              <Select
                style={{ width: 200 }}
                allowClear
                placeholder="无（顶级分类）"
                options={categories
                  .filter(c => !editing || c.id !== editing.id)
                  .map(c => ({ value: c.id, label: c.name }))}
              />
            </Form.Item>
            <Form.Item name="level" label="层级">
              <InputNumber min={1} max={3} />
            </Form.Item>
            <Form.Item name="sortOrder" label="排序">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
