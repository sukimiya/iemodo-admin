import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, theme, Dropdown } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  UserOutlined,
  CreditCardOutlined,
  SettingOutlined,
  SafetyOutlined,
  ShopOutlined,
  AppstoreOutlined,
  TagsOutlined,
  TrophyOutlined,
  DatabaseOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/tenants', icon: <TeamOutlined />, label: '租户管理' },
  { key: '/users', icon: <UserOutlined />, label: '用户管理' },
  {
    key: 'products-group',
    icon: <ShopOutlined />,
    label: '商品管理',
    children: [
      { key: '/products', label: '商品列表', icon: <AppstoreOutlined /> },
      { key: '/categories', label: '商品分类', icon: <TagsOutlined /> },
      { key: '/brands', label: '商品品牌', icon: <TrophyOutlined /> },
    ],
  },
  { key: '/inventory', icon: <DatabaseOutlined />, label: '库存管理' },
  { key: '/billing', icon: <CreditCardOutlined />, label: '账单管理' },
  { key: '/roles', icon: <SafetyOutlined />, label: '角色管理' },
  { key: '/settings', icon: <SettingOutlined />, label: '系统设置' },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const { token: themeToken } = theme.useToken();

  const selectedKey = '/' + location.pathname.split('/')[1];

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: collapsed ? 16 : 20,
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
          }}
        >
          {collapsed ? 'IE' : 'IEMODO Admin'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={['products-group']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: themeToken.colorBgContainer,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${themeToken.colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          <Dropdown
            menu={{
              items: [
                { key: 'profile', icon: <UserOutlined />, label: '个人信息' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'logout') handleLogout();
              },
            }}
          >
            <Button type="text" icon={<UserOutlined />}>
              {user?.displayName || 'Admin'}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
