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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  BookOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/api';
import { Book } from '../../types';
import styled from 'styled-components';

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
  .books-table {
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

const BooksPage: React.FC = () => {
  const { hasAnyRole } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchAuthor, setSearchAuthor] = useState('');
  const [currentPage, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getBooks();
      
      if (Array.isArray(response)) {
        // Filter data based on search terms
        let filteredBooks = response;
        
        if (searchTerm) {
          filteredBooks = filteredBooks.filter(book => 
            book.title.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        if (searchAuthor) {
          filteredBooks = filteredBooks.filter(book => 
            book.author.toLowerCase().includes(searchAuthor.toLowerCase())
          );
        }
        
        // Simple pagination
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
        
        setBooks(paginatedBooks);
        setTotal(filteredBooks.length);
      } else {
        // Paginated response
        setBooks(response.content || response.data || []);
        setTotal(response.totalElements || response.total || 0);
      }
    } catch (error) {
      console.error('Failed to load books:', error);
      message.error('Không thể tải danh sách sách');
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, searchAuthor]);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  const handleSearch = (value: string, type: 'title' | 'author') => {
    if (type === 'title') {
      setSearchTerm(value);
    } else {
      setSearchAuthor(value);
    }
    setCurrent(1);
  };

  const handleCreate = () => {
    setSelectedBook(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (book: Book) => {
    setSelectedBook(book);
    form.setFieldsValue(book);
    setIsModalVisible(true);
  };

  const handleViewDetail = (book: Book) => {
    setSelectedBook(book);
    setIsDetailModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await apiService.deleteBook(id);
      message.success('Xóa sách thành công');
      loadBooks();
    } catch (error) {
      console.error('Failed to delete book:', error);
      message.error('Không thể xóa sách');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (selectedBook) {
        await apiService.updateBook(selectedBook.id, values);
        message.success('Cập nhật sách thành công');
      } else {
        await apiService.createBook(values);
        message.success('Thêm sách thành công');
      }
      setIsModalVisible(false);
      loadBooks();
    } catch (error) {
      console.error('Failed to save book:', error);
      message.error('Không thể lưu thông tin sách');
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
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text: string, record: Book) => (
        <Button type="link" onClick={() => handleViewDetail(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Tác giả',
      dataIndex: 'author',
      key: 'author',
      ellipsis: true,
    },
    {
      title: 'ISBN',
      dataIndex: 'isbn',
      key: 'isbn',
      width: 130,
    },
    {
      title: 'Thể loại',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color="blue">{category}</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'available',
      key: 'available',
      width: 100,
      render: (available: boolean) => (
        <Tag color={available ? 'green' : 'red'}>
          {available ? 'Có sẵn' : 'Đã mượn'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 150,
      render: (_: any, record: Book) => (
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
                title="Bạn có chắc chắn muốn xóa sách này?"
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
          <BookOutlined /> Quản lý sách
        </Title>
        {hasAnyRole(['LIBRARIAN', 'ADMIN']) && (
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Thêm sách mới
          </Button>
        )}
      </PageHeader>

      <Card>
        <SearchContainer>
          <Search
            placeholder="Tìm theo tiêu đề sách"
            allowClear
            style={{ width: 300 }}
            onSearch={(value) => handleSearch(value, 'title')}
            suffix={<SearchOutlined />}
          />
          <Search
            placeholder="Tìm theo tác giả"
            allowClear
            style={{ width: 250 }}
            onSearch={(value) => handleSearch(value, 'author')}
            suffix={<SearchOutlined />}
          />
        </SearchContainer>

        <TableContainer>
          <Table<Book>
            columns={columns}
            dataSource={books}
            rowKey="id"
            loading={loading}
            pagination={false}
            style={{ marginTop: 16 }}
            scroll={{ x: 1000 }}
            className="books-table"
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
              `${range[0]}-${range[1]} của ${total} sách`
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
        title={selectedBook ? 'Chỉnh sửa sách' : 'Thêm sách mới'}
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
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
              >
                <Input placeholder="Nhập tiêu đề sách" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="author"
                label="Tác giả"
                rules={[{ required: true, message: 'Vui lòng nhập tác giả' }]}
              >
                <Input placeholder="Nhập tên tác giả" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="isbn"
                label="ISBN"
                rules={[{ required: true, message: 'Vui lòng nhập ISBN' }]}
              >
                <Input placeholder="Nhập mã ISBN" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="Thể loại"
                rules={[{ required: true, message: 'Vui lòng nhập thể loại' }]}
              >
                <Input placeholder="Nhập thể loại sách" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea rows={4} placeholder="Nhập mô tả sách" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="publisher"
                label="Nhà xuất bản"
              >
                <Input placeholder="Nhập nhà xuất bản" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="publishedYear"
                label="Năm xuất bản"
              >
                <Input type="number" placeholder="Nhập năm xuất bản" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedBook ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết sách"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedBook && (
          <div style={{ padding: '20px 0' }}>
            <Row gutter={[16, 16]}>
              <Col span={8}><strong>ID:</strong></Col>
              <Col span={16}>{selectedBook.id}</Col>
              
              <Col span={8}><strong>Tiêu đề:</strong></Col>
              <Col span={16}>{selectedBook.title}</Col>
              
              <Col span={8}><strong>Tác giả:</strong></Col>
              <Col span={16}>{selectedBook.author}</Col>
              
              <Col span={8}><strong>ISBN:</strong></Col>
              <Col span={16}>{selectedBook.isbn}</Col>
              
              <Col span={8}><strong>Thể loại:</strong></Col>
              <Col span={16}>
                <Tag color="blue">{selectedBook.category}</Tag>
              </Col>
              
              <Col span={8}><strong>Trạng thái:</strong></Col>
              <Col span={16}>
                <Tag color={selectedBook.available ? 'green' : 'red'}>
                  {selectedBook.available ? 'Có sẵn' : 'Đã mượn'}
                </Tag>
              </Col>
              
              {selectedBook.publisher && (
                <>
                  <Col span={8}><strong>Nhà xuất bản:</strong></Col>
                  <Col span={16}>{selectedBook.publisher}</Col>
                </>
              )}
              
              {selectedBook.publishedYear && (
                <>
                  <Col span={8}><strong>Năm xuất bản:</strong></Col>
                  <Col span={16}>{selectedBook.publishedYear}</Col>
                </>
              )}
              
              {selectedBook.description && (
                <>
                  <Col span={8}><strong>Mô tả:</strong></Col>
                  <Col span={16}>{selectedBook.description}</Col>
                </>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BooksPage;