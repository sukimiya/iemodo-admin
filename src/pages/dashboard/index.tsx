import { Card, Col, Row, Statistic, Table, Tag, Typography } from 'antd';
import { ShoppingCartOutlined, TeamOutlined, ApiOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getTenants } from '../../api/tenants';
import { getTodayOrderCount, getUsageStatus } from '../../api/dashboard';
import type { Tenant } from '../../api/tenants';

const { Title } = Typography;

export default function DashboardPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [todayOrders, setTodayOrders] = useState(0);
  const [apiCalls, setApiCalls] = useState(0);

  useEffect(() => {
    getTenants().then((res) => setTenants(res.data.data || []));
    getTodayOrderCount()
      .then((res) => setTodayOrders(res.data.data ?? 0))
      .catch(() => {});
    getUsageStatus('api_calls')
      .then((res) => setApiCalls(res.data.data?.currentUsage ?? 0))
      .catch(() => {});
  }, []);

  const activeTenants = tenants.filter((t) => t.tenantStatus === 'ACTIVE');

  const columns = [
    { title: '租户名称', dataIndex: 'tenantName', key: 'tenantName' },
    { title: '编码', dataIndex: 'tenantCode', key: 'tenantCode' },
    {
      title: '状态',
      dataIndex: 'tenantStatus',
      key: 'tenantStatus',
      render: (s: string) => (
        <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{s}</Tag>
      ),
    },
    { title: '套餐', dataIndex: 'planType', key: 'planType' },
    { title: '联系人', dataIndex: 'contactEmail', key: 'contactEmail' },
  ];

  return (
    <div>
      <Title level={4}>概览</Title>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic title="活跃租户" value={activeTenants.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="总租户" value={tenants.length} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="今日订单" value={todayOrders} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="API 调用" value={apiCalls} prefix={<ApiOutlined />} />
          </Card>
        </Col>
      </Row>

      <Card title="租户列表">
        <Table
          dataSource={tenants}
          columns={columns}
          rowKey="tenantId"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  );
}
