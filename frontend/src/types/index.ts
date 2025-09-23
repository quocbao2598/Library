// Types cho authentication và user
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'LIBRARIAN' | 'ADMIN';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  username: string;
  role: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'USER' | 'LIBRARIAN' | 'ADMIN';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Types cho Books
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  genre?: string;
  description?: string;
  publisher?: string;
  publishedYear?: number;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookCreateRequest {
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  available: boolean;
}

// Types cho Members
export interface Member {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  joinDate?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MemberCreateRequest {
  name: string;
  email: string;
  password: string;
}

// Types cho Loans
export interface Loan {
  id: number;
  memberId: number;
  bookId: number;
  borrowDate: string;
  returnDate?: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
  member?: Member;
  book?: Book;
}

export interface LoanCreateRequest {
  memberId: number;
  bookId: number;
  borrowDate: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE';
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Dashboard types
export interface DashboardData {
  username: string;
  role: string;
  fullName: string;
  type: string;
  features: string[];
}

export interface NavigationData {
  menuItems: string[];
  allowedPages: string[];
}

// Error types
export interface ApiError {
  error: string;
  message?: string;
  status?: number;
}