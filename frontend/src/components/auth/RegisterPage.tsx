import React, { useState } from 'react';
import { Form, Input, Button, Card, Alert, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const { Title, Text } = Typography;

const RegisterContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const RegisterCard = styled(Card)`
  width: 100%;
  max-width: 500px;
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

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await register({
        username: values.username,
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      
      if (result.success) {
        setSuccess('Đăng ký thành công! Chuyển hướng đến dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.error || 'Đăng ký thất bại');
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_: any, value: string) => {
    if (!value || value.length < 6) {
      return Promise.reject(new Error('Mật khẩu phải có ít nhất 6 ký tự!'));
    }
    return Promise.resolve();
  };

  const validateConfirmPassword = (_: any, value: string) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng xác nhận mật khẩu!'));
    }
    if (value !== form.getFieldValue('password')) {
      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
    }
    return Promise.resolve();
  };

  return (
    <RegisterContainer>
      <RegisterCard>
        <Logo>
          <Title level={1}>📚 LibraryMS</Title>
          <Text>Đăng ký tài khoản mới</Text>
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

        {success && (
          <Alert
            message={success}
            type="success"
            style={{ marginBottom: 24 }}
          />
        )}

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="Họ"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ!' },
                  { min: 2, message: 'Họ phải có ít nhất 2 ký tự!' },
                ]}
              >
                <Input
                  prefix={<UserAddOutlined />}
                  placeholder="Nhập họ"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Tên"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên!' },
                  { min: 2, message: 'Tên phải có ít nhất 2 ký tự!' },
                ]}
              >
                <Input
                  prefix={<UserAddOutlined />}
                  placeholder="Nhập tên"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Vui lòng nhập username!' },
              { min: 3, message: 'Username phải có ít nhất 3 ký tự!' },
              { pattern: /^[a-zA-Z0-9_]+$/, message: 'Username chỉ được chứa chữ cái, số và dấu gạch dưới!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nhập username"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Nhập email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { validator: validatePassword },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              { validator: validateConfirmPassword },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
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
              Đăng ký
            </Button>
          </Form.Item>
        </Form>

        <Row justify="space-between" align="middle">
          <Col>
            <Text>Đã có tài khoản?</Text>
          </Col>
          <Col>
            <Link to="/login">
              <Button type="link" style={{ padding: 0 }}>
                Đăng nhập ngay
              </Button>
            </Link>
          </Col>
        </Row>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;