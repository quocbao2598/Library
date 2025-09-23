import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, Space, Button } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  DashboardOutlined,
  BookOutlined,
  UsergroupAddOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const StyledLayout = styled(Layout)`
  min-height: 100vh;
`;

const StyledHeader = styled(Header)`
  background: #fff;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 18px;
  font-weight: bold;
  color: #1890ff;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StyledContent = styled(Content)`
  margin: 24px;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

interface AppLayoutProps {
  children?: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, hasAnyRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        <Link to="/profile">Thông tin cá nhân</Link>
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        <Link to="/settings">Cài đặt</Link>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        Đăng xuất
      </Menu.Item>
    </Menu>
  );

  const getMenuItems = () => {
    const items = [
      {
        key: '/dashboard',
        icon: <DashboardOutlined />,
        label: <Link to="/dashboard">Dashboard</Link>,
      },
      {
        key: '/books',
        icon: <BookOutlined />,
        label: <Link to="/books">Quản lý sách</Link>,
      },
    ];

    // USER role - thêm My Loans
    if (hasAnyRole(['USER', 'LIBRARIAN', 'ADMIN'])) {
      items.push({
        key: '/my-loans',
        icon: <FileTextOutlined />,
        label: <Link to="/my-loans">Sách đã mượn</Link>,
      });
    }

    // LIBRARIAN và ADMIN - thêm Members và Loans management
    if (hasAnyRole(['LIBRARIAN', 'ADMIN'])) {
      items.push(
        {
          key: '/members',
          icon: <UsergroupAddOutlined />,
          label: <Link to="/members">Quản lý thành viên</Link>,
        },
        {
          key: '/loans',
          icon: <FileTextOutlined />,
          label: <Link to="/loans">Quản lý mượn/trả</Link>,
        }
      );
    }

    // ADMIN only - thêm User management
    if (hasAnyRole(['ADMIN'])) {
      items.push({
        key: '/admin',
        icon: <TeamOutlined />,
        label: <Link to="/admin">Quản lý người dùng</Link>,
      });
    }

    return items;
  };

  const selectedKeys = [location.pathname];

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <StyledLayout>
      <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
        <Logo style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
          📚 {!collapsed && 'LibraryMS'}
        </Logo>
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={getMenuItems()}
          style={{ borderRight: 0 }}
        />
      </Sider>

      <Layout>
        <StyledHeader>
          <Space>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </Space>

          <UserInfo>
            <Space>
              <Text strong>{user.firstName} {user.lastName}</Text>
              <Text type="secondary">({user.role})</Text>
              <Dropdown overlay={userMenu} placement="bottomRight">
                <Avatar
                  style={{ backgroundColor: '#1890ff', cursor: 'pointer' }}
                  icon={<UserOutlined />}
                />
              </Dropdown>
            </Space>
          </UserInfo>
        </StyledHeader>

        <StyledContent>
          {children}
        </StyledContent>
      </Layout>
    </StyledLayout>
  );
};

export default AppLayout;