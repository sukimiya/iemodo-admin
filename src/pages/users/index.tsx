import { Table, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getUsers } from '../../api/users';
import type { AdminUser } from '../../api/users';

const { Title } = Typography;

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getUsers()
      .then((res) => setUsers(res.data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '姓名', dataIndex: 'displayName', key: 'displayName' },
    { title: '租户', dataIndex: 'tenantId', key: 'tenantId' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={s === 'ACTIVE' ? 'green' : 'red'}>{s}</Tag>
      ),
    },
    {
      title: '邮箱验证',
      dataIndex: 'emailVerified',
      key: 'emailVerified',
      render: (v: boolean) => (v ? <Tag color="green">是</Tag> : <Tag>否</Tag>),
    },
  ];

  return (
    <div>
      <Title level={4}>用户管理</Title>
      <Table
        dataSource={users}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
