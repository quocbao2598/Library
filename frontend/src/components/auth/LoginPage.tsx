import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const { Title, Text } = Typography;

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const LoginCard = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  
  .ant-card-body {
    padding: 40px;
  }
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 32px;
  
  h1 {
    color: #1890ff;
    margin-bottom: 8px;
  }
  
  p {
    color: #666;
    margin-bottom: 0;
  }
`;

interface LoginFormValues {
  usernameOrEmail: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const result = await login(values.usernameOrEmail, values.password);
      
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.error || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <Title level={1}>📚 LibraryMS</Title>
          <Text>Hệ thống quản lý thư viện</Text>
        </Logo>

        {error && (
          <Alert
            message={error}
            type="error"
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="usernameOrEmail"
            label="Username hoặc Email"
            rules={[
              { required: true, message: 'Vui lòng nhập username hoặc email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập username hoặc email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              style={{ height: '48px', fontSize: '16px' }}
            >
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>

        <Row justify="space-between" align="middle">
          <Col>
            <Text>Chưa có tài khoản?</Text>
          </Col>
          <Col>
            <Link to="/register">
              <Button type="link" style={{ padding: 0 }}>
                Đăng ký ngay
              </Button>
            </Link>
          </Col>
        </Row>

        {/* Demo accounts info */}
        <Card 
          size="small" 
          title="Tài khoản demo" 
          style={{ marginTop: 24, backgroundColor: '#f5f5f5' }}
        >
          <Text style={{ fontSize: '12px' }}>
            <strong>Admin:</strong> admin / admin123<br />
            <strong>User demo:</strong> Đăng ký tài khoản mới
          </Text>
        </Card>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;