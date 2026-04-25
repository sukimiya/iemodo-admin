import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, Input, Select, InputNumber,
  message, Tag, Typography, Image, Popconfirm, Switch
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined
} from '@ant-design/icons';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
  getCategories,
} from '../../api/products';
import type { Product, Category } from '../../api/products';

const { Title } = Typography;

const statusColors: Record<string, string> = {
  ACTIVE: 'green',
  DRAFT: 'orange',
  ARCHIVED: 'red',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchProducts = () => {
    setLoading(true);
    getProducts({ status: statusFilter, page: 0, size: 50 })
      .then(res => {
        const data = res.data?.data || res.data || [];
        setProducts(Array.isArray(data) ? data : []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    getCategories().then(res => {
      const data = res.data?.data || res.data || [];
      setCategories(Array.isArray(data) ? data : []);
    });
  }, [statusFilter]);

  const handleCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    form.setFieldsValue({ productStatus: 'DRAFT' });
    setModalOpen(true);
  };

  const handleEdit = (record: Product) => {
    setEditingProduct(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteProduct(id);
      message.success('商品已删除');
      fetchProducts();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
        message.success('商品已更新');
      } else {
        await createProduct(values);
        message.success('商品已创建');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      if (err instanceof Error) message.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: '图片',
      dataIndex: 'mainImage',
      width: 80,
      render: (url: string) => (
        <Image
          src={url || 'https://placehold.co/60x60/e2e8f0/94a3b8?text=N/A'}
          width={60}
          height={60}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="https://placehold.co/60x60/e2e8f0/94a3b8?text=N/A"
        />
      ),
    },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    {
      title: '状态',
      dataIndex: 'productStatus',
      width: 100,
      render: (s: string) => <Tag color={statusColors[s] || 'default'}>{s}</Tag>,
    },
    {
      title: '价格',
      dataIndex: 'basePrice',
      width: 100,
      render: (v: number) => v != null ? `$${v.toFixed(2)}` : '-',
    },
    {
      title: '分类',
      dataIndex: 'categoryId',
      width: 120,
      render: (id: number) => categories.find(c => c.id === id)?.name || `#${id}`,
    },
    { title: '销量', dataIndex: 'saleCount', width: 80 },
    {
      title: '操作',
      width: 160,
      render: (_: unknown, record: Product) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
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
        <Title level={4} style={{ margin: 0 }}>商品管理</Title>
        <Space>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 120 }}
            options={[
              { value: 'ACTIVE', label: '已上架' },
              { value: 'DRAFT', label: '草稿' },
              { value: 'ARCHIVED', label: '已归档' },
              { value: '', label: '全部' },
            ]}
          />
          <Input
            placeholder="搜索商品..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建商品
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          dataSource={products.filter(p => !search || p.title?.toLowerCase().includes(search.toLowerCase()))}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20, showTotal: (t) => `共 ${t} 条` }}
        />
      </Card>

      <Modal
        title={editingProduct ? '编辑商品' : '新建商品'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        width={640}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="categoryId" label="分类" rules={[{ required: true }]}>
              <Select
                style={{ width: 200 }}
                showSearch
                optionFilterProp="label"
                options={categories.filter(c => c.isActive).map(c => ({
                  value: c.id,
                  label: c.name,
                }))}
              />
            </Form.Item>
            <Form.Item name="productStatus" label="状态">
              <Select style={{ width: 120 }} options={[
                { value: 'DRAFT', label: '草稿' },
                { value: 'ACTIVE', label: '上架' },
                { value: 'ARCHIVED', label: '归档' },
              ]} />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="basePrice" label="基础价格">
              <InputNumber prefix="$" min={0} step={0.01} />
            </Form.Item>
            <Form.Item name="marketPrice" label="市场价">
              <InputNumber prefix="$" min={0} step={0.01} />
            </Form.Item>
            <Form.Item name="weightG" label="重量(g)">
              <InputNumber min={0} />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="originCountry" label="原产国">
              <Input style={{ width: 120 }} />
            </Form.Item>
            <Form.Item name="mainImage" label="主图URL">
              <Input style={{ width: 300 }} placeholder="https://..." />
            </Form.Item>
          </Space>
          <Space style={{ display: 'flex' }} align="start">
            <Form.Item name="productCode" label="商品编码">
              <Input />
            </Form.Item>
            <Form.Item name="spuCode" label="SPU编码">
              <Input />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
