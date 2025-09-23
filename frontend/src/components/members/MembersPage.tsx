import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  Button,
  Input,
  Space,
  Card,
  Typography,
  Modal,
  Form,
  message,
  Popconfirm,
  Tag,
  Row,
  Col,
  Pagination,
  DatePicker,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UserOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Member } from '../../types';
import styled from 'styled-components';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Search } = Input;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const TableContainer = styled.div`
  .members-table {
    .ant-table {
      background: white;
      border-radius: 8px;
    }
    
    .ant-table-thead > tr > th {
      background: #f8f9fa;
      font-weight: 600;
    }
  }
`;

const MembersPage: React.FC = () => {
  const { hasAnyRole } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [currentPage, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getMembers();
      
      if (Array.isArray(response)) {
        // Filter data based on search terms
        let filteredMembers = response;
        
        if (searchTerm) {
          filteredMembers = filteredMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (searchEmail) {
          filteredMembers = filteredMembers.filter(member => 
            member.email.toLowerCase().includes(searchEmail.toLowerCase())
          );
        }
        
        // Simple pagination
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedMembers = filteredMembers.slice(startIndex, endIndex);
        
        setMembers(paginatedMembers);
        setTotal(filteredMembers.length);
      } else {
        setMembers(response.content || response.data || []);
        setTotal(response.totalElements || response.total || 0);
      }
    } catch (error) {
      console.error('Failed to load members:', error);
      message.error('Không thể tải danh sách thành viên');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, searchEmail]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleSearch = (value: string, type: 'name' | 'email') => {
    if (type === 'name') {
      setSearchTerm(value);
    } else {
      setSearchEmail(value);
    }
    setCurrent(1);
  };

  const handleCreate = () => {
    setSelectedMember(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    const formData = {
      ...member,
      joinDate: member.joinDate ? dayjs(member.joinDate) : null,
    };
    form.setFieldsValue(formData);
    setIsModalVisible(true);
  };

  const handleViewDetail = (member: Member) => {
    setSelectedMember(member);
    setIsDetailModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteMember(id);
      message.success('Xóa thành viên thành công');
      loadMembers();
    } catch (error) {
      console.error('Failed to delete member:', error);
      message.error('Không thể xóa thành viên');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        joinDate: values.joinDate ? values.joinDate.format('YYYY-MM-DD') : null,
      };
      
      if (selectedMember) {
        await apiService.updateMember(selectedMember.id, submitData);
        message.success('Cập nhật thành viên thành công');
      } else {
        await apiService.createMember(submitData);
        message.success('Thêm thành viên thành công');
      }
      setIsModalVisible(false);
      loadMembers();
    } catch (error) {
      console.error('Failed to save member:', error);
      message.error('Không thể lưu thông tin thành viên');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: true,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text: string, record: Member) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          <UserOutlined /> {text}
        </Button>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
      render: (email: string) => (
        <span>
          <MailOutlined /> {email}
        </span>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone: string) => phone && (
        <span>
          <PhoneOutlined /> {phone}
        </span>
      ),
    },
    {
      title: 'Ngày tham gia',
      dataIndex: 'joinDate',
      key: 'joinDate',
      width: 120,
      render: (date: string) => date && dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      key: 'active',
      width: 100,
      render: (active: boolean) => (
        <Tag color={active ? 'green' : 'red'}>
          {active ? 'Hoạt động' : 'Ngưng hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: Member) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            title="Xem chi tiết"
          />
          {hasAnyRole(['LIBRARIAN', 'ADMIN']) && (
            <>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
                title="Chỉnh sửa"
              />
              <Popconfirm
                title="Bạn có chắc chắn muốn xóa thành viên này?"
                onConfirm={() => handleDelete(record.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  title="Xóa"
                />
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader>
        <Title level={2}>
          <UserOutlined /> Quản lý thành viên
        </Title>
        {hasAnyRole(['LIBRARIAN', 'ADMIN']) && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm thành viên mới
          </Button>
        )}
      </PageHeader>

      <Card>
        <SearchContainer>
          <Search
            placeholder="Tìm theo tên thành viên"
            allowClear
            style={{ width: 300 }}
            onSearch={(value) => handleSearch(value, 'name')}
            suffix={<SearchOutlined />}
          />
          <Search
            placeholder="Tìm theo email"
            allowClear
            style={{ width: 250 }}
            onSearch={(value) => handleSearch(value, 'email')}
            suffix={<SearchOutlined />}
          />
        </SearchContainer>

        <TableContainer>
          <Table<Member>
            columns={columns}
            dataSource={members}
            rowKey="id"
            loading={loading}
            pagination={false}
            style={{ marginTop: 16 }}
            scroll={{ x: 1000 }}
            className="members-table"
          />
        </TableContainer>

        <Row justify="end" style={{ marginTop: 16 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} của ${total} thành viên`
            }
            onChange={(page, size) => {
              setCurrent(page);
              setPageSize(size || 10);
            }}
          />
        </Row>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={selectedMember ? 'Chỉnh sửa thành viên' : 'Thêm thành viên mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginTop: 20 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên thành viên"
                rules={[{ required: true, message: 'Vui lòng nhập tên' }]}
              >
                <Input placeholder="Nhập tên thành viên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="joinDate"
                label="Ngày tham gia"
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày tham gia"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedMember ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết thành viên"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedMember && (
          <div style={{ padding: '20px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={8}><strong>ID:</strong></Col>
              <Col span={16}>{selectedMember.id}</Col>
              
              <Col span={8}><strong>Tên:</strong></Col>
              <Col span={16}>{selectedMember.name}</Col>
              
              <Col span={8}><strong>Email:</strong></Col>
              <Col span={16}>
                <MailOutlined /> {selectedMember.email}
              </Col>
              
              {selectedMember.phone && (
                <>
                  <Col span={8}><strong>Số điện thoại:</strong></Col>
                  <Col span={16}>
                    <PhoneOutlined /> {selectedMember.phone}
                  </Col>
                </>
              )}
              
              {selectedMember.joinDate && (
                <>
                  <Col span={8}><strong>Ngày tham gia:</strong></Col>
                  <Col span={16}>{dayjs(selectedMember.joinDate).format('DD/MM/YYYY')}</Col>
                </>
              )}
              
              <Col span={8}><strong>Trạng thái:</strong></Col>
              <Col span={16}>
                <Tag color={selectedMember.active ? 'green' : 'red'}>
                  {selectedMember.active ? 'Hoạt động' : 'Ngưng hoạt động'}
                </Tag>
              </Col>
              
              {selectedMember.address && (
                <>
                  <Col span={8}><strong>Địa chỉ:</strong></Col>
                  <Col span={16}>{selectedMember.address}</Col>
                </>
              )}
              
              {selectedMember.createdAt && (
                <>
                  <Col span={8}><strong>Ngày tạo:</strong></Col>
                  <Col span={16}>{dayjs(selectedMember.createdAt).format('DD/MM/YYYY HH:mm')}</Col>
                </>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MembersPage;