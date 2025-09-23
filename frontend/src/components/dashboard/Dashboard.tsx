import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Card, Statistic, Typography, Space, Button, List, Badge } from 'antd';
import {
  BookOutlined,
  UserOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Book, Loan } from '../../types';
import styled from 'styled-components';

const { Title, Text } = Typography;

interface DashboardStats {
  totalBooks?: number;
  availableBooks?: number;
  totalMembers?: number;
  totalLoans?: number;
  overdueCount?: number;
  totalUsers?: number;
  adminCount?: number;
  librarianCount?: number;
  userCount?: number;
}

const WelcomeCard = styled(Card)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-bottom: 24px;
  
  .ant-card-body {
    padding: 32px;
  }
  
  h2 {
    color: white !important;
    margin-bottom: 8px;
  }
`;

const StatisticCard = styled(Card)`
  text-align: center;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
`;

const QuickActionCard = styled(Card)`
  .ant-card-body {
    padding: 16px;
  }
`;

const Dashboard: React.FC = () => {
  const { user, hasRole, hasAnyRole } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentBooks, setRecentBooks] = useState<Book[]>([]);
  const [myLoans, setMyLoans] = useState<Loan[]>([]);
  const [overdueLoans, setOverdueLoans] = useState<Loan[]>([]);

  const loadDashboardData = useCallback(async () => {
    try {
      // Load data dựa trên role
      const promises = [];
      
      // Tất cả users có thể xem sách
      promises.push(apiService.getBooks());
      
      if (hasAnyRole(['USER', 'LIBRARIAN', 'ADMIN'])) {
        promises.push(apiService.getMyLoans());
      }
      
      if (hasAnyRole(['LIBRARIAN', 'ADMIN'])) {
        promises.push(apiService.getMembers());
        promises.push(apiService.getLoans());
        promises.push(apiService.getOverdueLoans());
      }
      
      if (hasRole('ADMIN')) {
        promises.push(apiService.getUserStats());
      }

      const results = await Promise.allSettled(promises);
      
      // Process results with type checking
      const books = results[0].status === 'fulfilled' ? (results[0] as PromiseFulfilledResult<any>).value : [];
      setRecentBooks(books.slice(0, 5));
      
      let resultIndex = 1;
      
      if (hasAnyRole(['USER', 'LIBRARIAN', 'ADMIN'])) {
        const loans = results[resultIndex].status === 'fulfilled' ? (results[resultIndex] as PromiseFulfilledResult<any>).value : [];
        setMyLoans(loans.slice(0, 5));
        resultIndex++;
      }
      
      if (hasAnyRole(['LIBRARIAN', 'ADMIN'])) {
        const members = results[resultIndex].status === 'fulfilled' ? (results[resultIndex] as PromiseFulfilledResult<any>).value : [];
        const allLoans = results[resultIndex + 1].status === 'fulfilled' ? (results[resultIndex + 1] as PromiseFulfilledResult<any>).value : [];
        const overdue = results[resultIndex + 2].status === 'fulfilled' ? (results[resultIndex + 2] as PromiseFulfilledResult<any>).value : [];
        
        setOverdueLoans(overdue);
        
        setStats((prev: DashboardStats) => ({
          ...prev,
          totalBooks: books.length,
          availableBooks: books.filter((book: Book) => book.available).length,
          totalMembers: members.length,
          totalLoans: allLoans.length,
          overdueCount: overdue.length,
        }));
        
        resultIndex += 3;
      }
      
      if (hasRole('ADMIN')) {
        const userStats = results[resultIndex].status === 'fulfilled' ? (results[resultIndex] as PromiseFulfilledResult<any>).value : {};
        setStats((prev: DashboardStats) => ({ ...prev, ...userStats }));
      }
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  }, [hasRole, hasAnyRole]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const renderUserDashboard = () => (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Sách đang mượn"
              value={myLoans.filter(loan => loan.status === 'BORROWED').length}
              prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Sách có sẵn"
              value={stats.availableBooks || 0}
              prefix={<BookOutlined style={{ color: '#52c41a' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Tổng số sách"
              value={stats.totalBooks || 0}
              prefix={<BookOutlined style={{ color: '#722ed1' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Lịch sử mượn"
              value={myLoans.length}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
            />
          </StatisticCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Sách đang mượn" extra={<Link to="/my-loans">Xem tất cả</Link>}>
            <List
              dataSource={myLoans.filter(loan => loan.status === 'BORROWED').slice(0, 5)}
              renderItem={(loan) => (
                <List.Item>
                  <List.Item.Meta
                    title={loan.book?.title}
                    description={`Ngày mượn: ${loan.borrowDate}`}
                  />
                  <Badge 
                    status={loan.status === 'OVERDUE' ? 'error' : 'processing'} 
                    text={loan.status === 'OVERDUE' ? 'Quá hạn' : 'Đang mượn'} 
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Sách mới" 
            extra={<Link to="/books">Xem tất cả</Link>}
          >
            <List
              dataSource={recentBooks}
              renderItem={(book) => (
                <List.Item actions={[<Button type="link" icon={<EyeOutlined />}>Xem</Button>]}>
                  <List.Item.Meta
                    title={book.title}
                    description={`Tác giả: ${book.author}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderLibrarianDashboard = () => (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Tổng số sách"
              value={stats.totalBooks || 0}
              prefix={<BookOutlined style={{ color: '#1890ff' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Thành viên"
              value={stats.totalMembers || 0}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Đang cho mượn"
              value={stats.totalLoans || 0}
              prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Quá hạn"
              value={stats.overdueCount || 0}
              prefix={<ClockCircleOutlined style={{ color: '#ff4d4f' }} />}
            />
          </StatisticCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <QuickActionCard title="Thao tác nhanh">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" icon={<PlusOutlined />} block>
                <Link to="/books/create">Thêm sách mới</Link>
              </Button>
              <Button icon={<PlusOutlined />} block>
                <Link to="/members/create">Thêm thành viên</Link>
              </Button>
              <Button icon={<PlusOutlined />} block>
                <Link to="/loans/create">Tạo phiếu mượn</Link>
              </Button>
            </Space>
          </QuickActionCard>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Sách quá hạn" extra={<Link to="/loans?filter=overdue">Xem tất cả</Link>}>
            <List
              dataSource={overdueLoans.slice(0, 5)}
              renderItem={(loan) => (
                <List.Item>
                  <List.Item.Meta
                    title={loan.book?.title}
                    description={`Người mượn: ${loan.member?.name} | Ngày mượn: ${loan.borrowDate}`}
                  />
                  <Badge status="error" text="Quá hạn" />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderAdminDashboard = () => (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Tổng người dùng"
              value={stats.totalUsers || 0}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Admin"
              value={stats.adminCount || 0}
              prefix={<UserOutlined style={{ color: '#ff4d4f' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Thủ thư"
              value={stats.librarianCount || 0}
              prefix={<UserOutlined style={{ color: '#722ed1' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Người dùng"
              value={stats.userCount || 0}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </StatisticCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Tổng số sách"
              value={stats.totalBooks || 0}
              prefix={<BookOutlined style={{ color: '#1890ff' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Thành viên"
              value={stats.totalMembers || 0}
              prefix={<UserOutlined style={{ color: '#52c41a' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Đang cho mượn"
              value={stats.totalLoans || 0}
              prefix={<FileTextOutlined style={{ color: '#722ed1' }} />}
            />
          </StatisticCard>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard>
            <Statistic
              title="Quá hạn"
              value={stats.overdueCount || 0}
              prefix={<ClockCircleOutlined style={{ color: '#ff4d4f' }} />}
            />
          </StatisticCard>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={8}>
          <QuickActionCard title="Quản trị hệ thống">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button type="primary" icon={<PlusOutlined />} block>
                <Link to="/admin/users/create">Tạo người dùng</Link>
              </Button>
              <Button icon={<EyeOutlined />} block>
                <Link to="/admin/users">Quản lý người dùng</Link>
              </Button>
              <Button icon={<EyeOutlined />} block>
                <Link to="/admin/reports">Báo cáo hệ thống</Link>
              </Button>
            </Space>
          </QuickActionCard>
        </Col>
        <Col xs={24} lg={16}>
          <Card title="Hoạt động gần đây">
            <Text type="secondary">Chức năng này sẽ được triển khai trong phiên bản tiếp theo</Text>
          </Card>
        </Col>
      </Row>
    </>
  );

  const renderDashboardContent = () => {
    if (hasRole('ADMIN')) {
      return renderAdminDashboard();
    } else if (hasRole('LIBRARIAN')) {
      return renderLibrarianDashboard();
    } else {
      return renderUserDashboard();
    }
  };

  return (
    <div>
      <WelcomeCard>
        <Title level={2}>
          Chào mừng, {user?.firstName} {user?.lastName}! 👋
        </Title>
        <Text style={{ fontSize: '16px', opacity: 0.9 }}>
          {hasRole('ADMIN') && 'Bạn đang đăng nhập với quyền Quản trị viên'}
          {hasRole('LIBRARIAN') && 'Bạn đang đăng nhập với quyền Thủ thư'}
          {hasRole('USER') && 'Chào mừng bạn đến với hệ thống thư viện'}
        </Text>
      </WelcomeCard>

      {renderDashboardContent()}
    </div>
  );
};

export default Dashboard;