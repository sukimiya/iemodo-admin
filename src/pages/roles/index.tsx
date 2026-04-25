import { useEffect, useState } from 'react';
import {
  Card, Tabs, Checkbox, Button, message, Spin, Typography, Divider, Alert, Tag, Space, Table, Modal, Select, Tooltip
} from 'antd';
import {
  SaveOutlined, LockOutlined, UserSwitchOutlined, SafetyOutlined
} from '@ant-design/icons';
import type { Permission, Role } from '../../api/roles';
import {
  getRoles, getPermissions, getRolePermissions, updateRolePermissions,
  updateUserRole,
} from '../../api/roles';
import { getUsers } from '../../api/users';

const { Title, Text } = Typography;

const moduleLabels: Record<string, string> = {
  dashboard: '仪表盘',
  tenant: '租户管理',
  user: '用户管理',
  order: '订单管理',
  billing: '账单管理',
  settings: '系统设置',
  role: '角色管理',
};

function groupByModule(permissions: Permission[]): Map<string, Permission[]> {
  const map = new Map<string, Permission[]>();
  for (const p of permissions) {
    const list = map.get(p.module) || [];
    list.push(p);
    map.set(p.module, list);
  }
  return map;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [rolePermCodes, setRolePermCodes] = useState<Set<string>>(new Set());
  const [originalPermCodes, setOriginalPermCodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // User-role assignment modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<string>('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    Promise.all([
      getRoles(),
      getPermissions(),
    ]).then(([rolesRes, permsRes]) => {
      const rolesData = rolesRes.data?.data || [];
      const permsData = permsRes.data?.data || [];
      setRoles(rolesData);
      setPermissions(permsData);
      if (rolesData.length > 0) {
        setSelectedRole(rolesData[0].role);
      }
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRole) return;
    setLoading(true);
    getRolePermissions(selectedRole)
      .then(res => {
        const codes = new Set<string>(res.data?.data || []);
        setRolePermCodes(codes);
        setOriginalPermCodes(new Set(codes));
      })
      .finally(() => setLoading(false));
  }, [selectedRole]);

  const isSuperAdmin = selectedRole === 'SUPER_ADMIN';
  const hasChanges = [...rolePermCodes].sort().join(',') !== [...originalPermCodes].sort().join(',');

  const handleToggle = (code: string, checked: boolean) => {
    const next = new Set(rolePermCodes);
    if (checked) next.add(code);
    else next.delete(code);
    setRolePermCodes(next);
  };

  const handleModuleToggle = (modulePerms: Permission[], checked: boolean) => {
    const next = new Set(rolePermCodes);
    for (const p of modulePerms) {
      if (checked) next.add(p.code);
      else next.delete(p.code);
    }
    setRolePermCodes(next);
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    setSaving(true);
    try {
      const selectedIds = permissions
        .filter(p => rolePermCodes.has(p.code))
        .map(p => p.id);
      await updateRolePermissions(selectedRole, selectedIds);
      setOriginalPermCodes(new Set(rolePermCodes));
      message.success('权限更新成功');
    } catch {
      message.error('权限更新失败');
    } finally {
      setSaving(false);
    }
  };

  const openAssignModal = async () => {
    setAssignModalOpen(true);
    setSelectedUserId(null);
    setSelectedNewRole('');
    try {
      const res = await getUsers();
      setUsers(res.data?.data || []);
    } catch {
      message.error('获取用户列表失败');
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedNewRole) return;
    setAssigning(true);
    try {
      await updateUserRole(selectedUserId, selectedNewRole);
      message.success('角色分配成功');
      setAssignModalOpen(false);
    } catch {
      message.error('角色分配失败');
    } finally {
      setAssigning(false);
    }
  };

  const grouped = groupByModule(permissions);

  if (loading && roles.length === 0) {
    return <Spin size="large" style={{ display: 'block', marginTop: 120 }} />;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>角色管理</Title>
        <Space>
          <Button icon={<UserSwitchOutlined />} onClick={openAssignModal}>
            分配用户角色
          </Button>
        </Space>
      </div>

      <Tabs
        activeKey={selectedRole}
        onChange={setSelectedRole}
        tabBarStyle={{ marginBottom: 0 }}
        items={roles.map(r => ({
          key: r.role,
          label: (
            <span>
              <SafetyOutlined style={{ marginRight: 4 }} />
              {r.name}
            </span>
          ),
          children: (
            <Card>
              <div style={{ marginBottom: 16 }}>
                <Text type="secondary">{roles.find(rr => rr.role === selectedRole)?.description}</Text>
              </div>

              {isSuperAdmin && (
                <Alert
                  message="超级管理员拥有所有权限，不可编辑"
                  type="info"
                  showIcon
                  icon={<LockOutlined />}
                  style={{ marginBottom: 16 }}
                />
              )}

              {!isSuperAdmin && hasChanges && (
                <Alert
                  message="你有未保存的更改"
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <Spin spinning={loading}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[...grouped.entries()].map(([module, perms]) => {
                    const allChecked = perms.every(p => rolePermCodes.has(p.code));
                    const someChecked = perms.some(p => rolePermCodes.has(p.code));
                    return (
                      <div key={module} style={{
                        padding: 12,
                        borderRadius: 6,
                        background: '#fafafa',
                        border: '1px solid #f0f0f0',
                      }}>
                        <div style={{ marginBottom: 8 }}>
                          <Checkbox
                            checked={allChecked}
                            indeterminate={someChecked && !allChecked}
                            onChange={e => handleModuleToggle(perms, e.target.checked)}
                            disabled={isSuperAdmin}
                          >
                            <Text strong style={{ fontSize: 15 }}>
                              {moduleLabels[module] || module}
                            </Text>
                            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                              ({perms.length} 项)
                            </Text>
                          </Checkbox>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 24 }}>
                          {perms.map(p => (
                            <Tooltip key={p.id} title={p.code}>
                              <Tag
                                color={rolePermCodes.has(p.code) ? 'blue' : 'default'}
                                style={{
                                  padding: '2px 8px',
                                  cursor: isSuperAdmin ? 'not-allowed' : 'pointer',
                                  userSelect: 'none',
                                }}
                                onClick={() => {
                                  if (!isSuperAdmin) handleToggle(p.code, !rolePermCodes.has(p.code));
                                }}
                              >
                                {p.name}
                              </Tag>
                            </Tooltip>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Spin>

              {!isSuperAdmin && (
                <>
                  <Divider />
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSave}
                    loading={saving}
                    disabled={!hasChanges}
                    size="large"
                  >
                    保存权限
                  </Button>
                  {hasChanges && (
                    <Button
                      style={{ marginLeft: 8 }}
                      onClick={() => setRolePermCodes(new Set(originalPermCodes))}
                    >
                      撤销更改
                    </Button>
                  )}
                </>
              )}
            </Card>
          ),
        }))}
      />

      <Modal
        title="分配用户角色"
        open={assignModalOpen}
        onCancel={() => setAssignModalOpen(false)}
        onOk={handleAssignRole}
        confirmLoading={assigning}
        okText="确认分配"
        cancelText="取消"
        okButtonProps={{ disabled: !selectedUserId || !selectedNewRole }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <Text strong>选择用户</Text>
            <Select
              showSearch
              style={{ width: '100%', marginTop: 4 }}
              placeholder="搜索用户..."
              value={selectedUserId}
              onChange={setSelectedUserId}
              filterOption={(input, option) =>
                (option?.label as string || '').toLowerCase().includes(input.toLowerCase())
              }
              options={users.map(u => ({
                value: u.id,
                label: `${u.displayName || u.email} (${u.email})`,
              }))}
            />
          </div>
          <div>
            <Text strong>分配角色</Text>
            <Select
              style={{ width: '100%', marginTop: 4 }}
              placeholder="选择角色"
              value={selectedNewRole}
              onChange={setSelectedNewRole}
              options={roles.map(r => ({
                value: r.role,
                label: r.name,
              }))}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
