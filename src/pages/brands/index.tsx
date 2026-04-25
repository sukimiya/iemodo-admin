import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Input, InputNumber,
  message, Typography, Popconfirm, Tag
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Brand } from '../../api/brands';
import {
  getBrands, createBrand, updateBrand, deleteBrand,
} from '../../api/brands';
import FileUpload from '../../components/FileUpload';
import PresignedImage from '../../components/PresignedImage';

const { Title } = Typography;

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    getBrands().then(res => {
      const data = res.data?.data || res.data || [];
      setBrands(Array.isArray(data) ? data : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ sortOrder: 0, isActive: true });
    setModalOpen(true);
  };

  const handleEdit = (record: Brand) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBrand(id);
      message.success('品牌已删除');
      fetchData();
    } catch { message.error('删除失败'); }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editing) {
        await updateBrand(editing.id, values);
        message.success('品牌已更新');
      } else {
        await createBrand(values);
        message.success('品牌已创建');
      }
      setModalOpen(false);
      fetchData();
    } catch { /* validation */ } finally { setSaving(false); }
  };

  const columns = [
    {
      title: 'Logo', dataIndex: 'logoUrl', width: 80,
      render: (url: string) => (
        <PresignedImage
          objectKey={url}
          width={48}
          height={48}
          style={{ objectFit: 'contain', borderRadius: 4 }}
        />
      ),
    },
    { title: '品牌名称', dataIndex: 'name', width: 150 },
    { title: '官网', dataIndex: 'website', ellipsis: true, render: (v: string) => v ? <a href={v} target="_blank">{v}</a> : '-' },
    { title: '描述', dataIndex: 'description', ellipsis: true },
    {
      title: '国家', dataIndex: 'countryCode', width: 80,
      render: (v: string) => v || '-',
    },
    {
      title: '排序', dataIndex: 'sortOrder', width: 60,
    },
    {
      title: '状态', dataIndex: 'isActive', width: 70,
      render: (v: boolean) => v ? <Tag color="green">启用</Tag> : <Tag color="default">禁用</Tag>,
    },
    {
      title: '操作', width: 140,
      render: (_: unknown, record: Brand) => (
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
        <Title level={4} style={{ margin: 0 }}>品牌管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建品牌</Button>
      </div>
      <Card>
        <Table dataSource={brands} columns={columns} rowKey="id" loading={loading} pagination={false} />
      </Card>
      <Modal
        title={editing ? '编辑品牌' : '新建品牌'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        width={560}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label="品牌名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="logoUrl" label="品牌Logo">
            <FileUpload prefix="products/brands" />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="website" label="官网">
              <Input style={{ width: 250 }} placeholder="https://..." />
            </Form.Item>
            <Form.Item name="countryCode" label="国家代码">
              <Input style={{ width: 100 }} placeholder="US" />
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
