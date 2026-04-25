import { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, message, Typography, Descriptions } from 'antd';
import { getTenants, getSubscription, suspendTenant, activateTenant } from '../../api/tenants';
import type { Tenant, TenantSubscription } from '../../api/tenants';

const { Title } = Typography;

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<Tenant | null>(null);
  const [subscription, setSubscription] = useState<TenantSubscription | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await getTenants();
      setTenants(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const showDetail = async (tenant: Tenant) => {
    setSelected(tenant);
    setDetailOpen(true);
    try {
      const res = await getSubscription(tenant.tenantId);
      setSubscription(res.data.data || null);
    } catch {
      setSubscription(null);
    }
  };

  const handleSuspend = async (tenantId: string) => {
    setActionLoading(tenantId);
    try {
      await suspendTenant(tenantId);
      message.success('租户已暂停');
      fetchTenants();
    } catch {
      message.error('操作失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivate = async (tenantId: string) => {
    setActionLoading(tenantId);
    try {
      await activateTenant(tenantId);
      message.success('租户已激活');
      fetchTenants();
    } catch {
      message.error('操作失败');
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'tenantName', key: 'tenantName' },
    { title: '编码', dataIndex: 'tenantCode', key: 'tenantCode' },
    {
      title: '状态',
      dataIndex: 'tenantStatus',
      key: 'tenantStatus',
      render: (s: string) => (
        <Tag color={s === 'ACTIVE' ? 'green' : s === 'SUSPENDED' ? 'orange' : 'red'}>{s}</Tag>
      ),
    },
    { title: '套餐', dataIndex: 'planType', key: 'planType' },
    { title: '邮箱', dataIndex: 'contactEmail', key: 'contactEmail' },
    {
      title: '操作',
      key: 'action',
      render: (_: unknown, record: Tenant) => (
        <>
          <Button type="link" onClick={() => showDetail(record)}>
            详情
          </Button>
          {record.tenantStatus === 'ACTIVE' ? (
            <Button
              type="link"
              danger
              loading={actionLoading === record.tenantId}
              onClick={() => handleSuspend(record.tenantId)}
            >
              暂停
            </Button>
          ) : (
            <Button
              type="link"
              loading={actionLoading === record.tenantId}
              onClick={() => handleActivate(record.tenantId)}
            >
              激活
            </Button>
          )}
        </>
      ),
    },
  ];

  return (
    <div>
      <Title level={4}>租户管理</Title>
      <Table
        dataSource={tenants}
        columns={columns}
        rowKey="tenantId"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={`租户详情 - ${selected?.tenantName}`}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={640}
      >
        {selected && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="租户ID">{selected.tenantId}</Descriptions.Item>
            <Descriptions.Item label="编码">{selected.tenantCode}</Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={selected.tenantStatus === 'ACTIVE' ? 'green' : 'red'}>
                {selected.tenantStatus}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="套餐">{selected.planType}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{selected.contactEmail}</Descriptions.Item>
            <Descriptions.Item label="电话">{selected.contactPhone}</Descriptions.Item>
          </Descriptions>
        )}
        {subscription && (
          <>
            <Title level={5} style={{ marginTop: 16 }}>订阅信息</Title>
            <Descriptions column={2} bordered size="small">
              <Descriptions.Item label="订阅状态">
                <Tag color={subscription.subscriptionStatus === 'ACTIVE' ? 'green' : 'red'}>
                  {subscription.subscriptionStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="周期开始">{subscription.currentPeriodStart}</Descriptions.Item>
              <Descriptions.Item label="周期结束">{subscription.currentPeriodEnd}</Descriptions.Item>
              <Descriptions.Item label="计费周期">#{subscription.billingCycleCount}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </div>
  );
}
