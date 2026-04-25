import { useEffect, useState } from 'react';
import { Card, Col, Row, Table, Tag, Typography, Descriptions } from 'antd';
import { getAllPlans, getBillingOverview } from '../../api/billing';
import { getTenants } from '../../api/tenants';
import type { Tenant } from '../../api/tenants';

const { Title } = Typography;

interface PlanDetail {
  id: string;
  displayName: string;
  maxProducts: number;
  maxOrdersPerMonth: number;
  maxApiCallsPerDay: number;
  maxStorageMb: number;
  maxAdminUsers: number;
  stripePriceId: string;
}

export default function BillingPage() {
  const [plans, setPlans] = useState<Record<string, PlanDetail>>({});
  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    getAllPlans().then((res) => setPlans(res.data.data || {}));
    getTenants().then((res) => setTenants(res.data.data || []));
  }, []);

  const planList = Object.values(plans);

  const planColumns = [
    { title: '套餐', dataIndex: 'displayName', key: 'displayName' },
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '商品上限', dataIndex: 'maxProducts', key: 'maxProducts' },
    { title: '月订单上限', dataIndex: 'maxOrdersPerMonth', key: 'maxOrdersPerMonth' },
    { title: '日API调用', dataIndex: 'maxApiCallsPerDay', key: 'maxApiCallsPerDay' },
    { title: '存储(MB)', dataIndex: 'maxStorageMb', key: 'maxStorageMb' },
    { title: '管理员数', dataIndex: 'maxAdminUsers', key: 'maxAdminUsers' },
    {
      title: 'Stripe Price',
      dataIndex: 'stripePriceId',
      key: 'stripePriceId',
      render: (v: string) => <Tag>{v}</Tag>,
    },
  ];

  const planDistribution = tenants.reduce(
    (acc, t) => {
      acc[t.planType] = (acc[t.planType] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div>
      <Title level={4}>账单管理</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        {Object.entries(planDistribution).map(([plan, count]) => (
          <Col span={6} key={plan}>
            <Card>
              <Descriptions size="small" column={1}>
                <Descriptions.Item label="套餐">{plan}</Descriptions.Item>
                <Descriptions.Item label="租户数">{count}</Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        ))}
      </Row>

      <Card title="套餐定义" style={{ marginBottom: 24 }}>
        <Table
          dataSource={planList}
          columns={planColumns}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
}
