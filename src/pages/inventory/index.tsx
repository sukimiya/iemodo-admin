import { useEffect, useState } from 'react';
import {
  Card, Table, Button, Space, Modal, Form, InputNumber, Select,
  message, Typography, Tag, Input, Statistic, Row, Col
} from 'antd';
import {
  AlertOutlined, SearchOutlined, PlusOutlined
} from '@ant-design/icons';
import type { InventoryItem } from '../../api/inventory';
import {
  getLowStockItems, inboundStock,
} from '../../api/inventory';
import type { Product } from '../../api/products';
import { getProducts } from '../../api/products';

const { Title, Text } = Typography;

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [inboundOpen, setInboundOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getLowStockItems(),
      getProducts({ status: '', page: 0, size: 200 }),
    ]).then(([invRes, prodRes]) => {
      const invData = invRes.data?.data || invRes.data || [];
      setItems(Array.isArray(invData) ? invData : []);
      const prodData = prodRes.data?.data || prodRes.data || [];
      setProducts(Array.isArray(prodData) ? prodData : []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const skuProductMap = new Map<number, Product>();
  products.forEach(p => {
    skuProductMap.set(p.id, p);
  });

  const lowStockCount = items.filter(i => (i.quantityAvailable || 0) <= (i.lowStockThreshold || 0)).length;

  const handleInbound = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await inboundStock(values);
      message.success('入库成功');
      setInboundOpen(false);
      fetchData();
    } catch { /* */ } finally { setSaving(false); }
  };

  const columns = [
    { title: 'SKU ID', dataIndex: 'skuId', width: 100 },
    {
      title: '商品', dataIndex: 'skuId', width: 180,
      render: (skuId: number) => {
        const prod = products.find(p => p.id === skuId);
        return prod?.title || `SKU #${skuId}`;
      },
    },
    { title: '仓库', dataIndex: 'warehouseId', width: 80, render: (v: number) => `WH-${v}` },
    {
      title: '在手数量', dataIndex: 'quantityOnHand', width: 100,
      render: (v: number, record: InventoryItem) => (
        <Text strong={record.quantityAvailable <= (record.lowStockThreshold || 0)}
          style={record.quantityAvailable <= (record.lowStockThreshold || 0) ? { color: '#ff4d4f' } : undefined}>
          {v ?? 0}
        </Text>
      ),
    },
    { title: '已预留', dataIndex: 'quantityReserved', width: 80, render: (v: number) => v ?? 0 },
    { title: '可用', dataIndex: 'quantityAvailable', width: 80, render: (v: number) => v ?? 0 },
    {
      title: '低库存阈值', dataIndex: 'lowStockThreshold', width: 100,
    },
    {
      title: '状态', width: 80,
      render: (_: unknown, record: InventoryItem) => {
        const available = record.quantityAvailable || 0;
        const threshold = record.lowStockThreshold || 0;
        if (available <= 0) return <Tag color="red">缺货</Tag>;
        if (available <= threshold) return <Tag color="orange">低库存</Tag>;
        return <Tag color="green">正常</Tag>;
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>库存管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setInboundOpen(true); }}>
          商品入库
        </Button>
      </div>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic title="全部SKU" value={items.length} suffix="个" />
          </Card>
        </Col>
        <Col span={6}>
          <Card size="small">
            <Statistic title="低库存预警" value={lowStockCount} valueStyle={{ color: lowStockCount > 0 ? '#ff4d4f' : undefined }} prefix={<AlertOutlined />} suffix="个" />
          </Card>
        </Col>
      </Row>

      <Card>
        <Table
          dataSource={items}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 20 }}
          size="small"
        />
      </Card>

      <Modal
        title="商品入库"
        open={inboundOpen}
        onCancel={() => setInboundOpen(false)}
        onOk={handleInbound}
        confirmLoading={saving}
        okText="入库"
        cancelText="取消"
        width={400}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="skuId" label="SKU / 商品" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="搜索商品..."
              optionFilterProp="label"
              options={products.map(p => ({ value: p.id, label: `#${p.id} ${p.title}` }))}
            />
          </Form.Item>
          <Form.Item name="warehouseId" label="仓库ID" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} placeholder="如: 1" />
          </Form.Item>
          <Form.Item name="quantity" label="入库数量" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="referenceNo" label="参考单号">
            <Input placeholder="采购单号等" />
          </Form.Item>
          <Form.Item name="reason" label="入库原因">
            <Input placeholder="如: 采购入库" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
