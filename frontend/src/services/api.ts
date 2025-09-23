import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthResponse, RefreshTokenRequest } from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL = 'http://localhost:8080/api';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor để thêm token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor để handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              const response = await this.refreshToken({ refreshToken });
              localStorage.setItem('accessToken', response.accessToken);
              
              // Retry original request với token mới
              originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.logout();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication methods
  async login(data: { usernameOrEmail: string; password: string }): Promise<AuthResponse> {
    const response = await axios.post(`${this.baseURL}/auth/login`, data);
    return response.data;
  }

  async register(data: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: string;
  }): Promise<AuthResponse> {
    const response = await axios.post(`${this.baseURL}/auth/register`, data);
    return response.data;
  }

  async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await axios.post(`${this.baseURL}/auth/refresh`, data);
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async getDashboard() {
    const response = await this.api.get('/user/dashboard');
    return response.data;
  }

  async getNavigation() {
    const response = await this.api.get('/user/navigation');
    return response.data;
  }

  // User profile methods
  async getProfile() {
    const response = await this.api.get('/user/profile');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.api.put('/user/profile', data);
    return response.data;
  }

  async changePassword(data: { oldPassword: string; newPassword: string }) {
    const response = await this.api.post('/user/change-password', data);
    return response.data;
  }

  // Books methods
  async getBooks() {
    const response = await this.api.get('/books');
    return response.data;
  }

  async getBook(id: number) {
    const response = await this.api.get(`/books/${id}`);
    return response.data;
  }

  async createBook(data: any) {
    const response = await this.api.post('/books', data);
    return response.data;
  }

  async updateBook(id: number, data: any) {
    const response = await this.api.put(`/books/${id}`, data);
    return response.data;
  }

  async deleteBook(id: number) {
    const response = await this.api.delete(`/books/${id}`);
    return response.data;
  }

  async searchBooks(params: { title?: string; author?: string; genre?: string }) {
    const response = await this.api.get('/books/search', { params });
    return response.data;
  }

  async getAvailableBooks() {
    const response = await this.api.get('/books/available');
    return response.data;
  }

  // Members methods
  async getMembers() {
    const response = await this.api.get('/members');
    return response.data;
  }

  async getMember(id: number) {
    const response = await this.api.get(`/members/${id}`);
    return response.data;
  }

  async createMember(data: any) {
    const response = await this.api.post('/members', data);
    return response.data;
  }

  async updateMember(id: number, data: any) {
    const response = await this.api.put(`/members/${id}`, data);
    return response.data;
  }

  async deleteMember(id: number) {
    const response = await this.api.delete(`/members/${id}`);
    return response.data;
  }

  async searchMembers(params: { name?: string; email?: string }) {
    const response = await this.api.get('/members/search', { params });
    return response.data;
  }

  // Loans methods
  async getLoans() {
    const response = await this.api.get('/loans');
    return response.data;
  }

  async getLoan(id: number) {
    const response = await this.api.get(`/loans/${id}`);
    return response.data;
  }

  async createLoan(data: any) {
    const response = await this.api.post('/loans', data);
    return response.data;
  }

  async updateLoan(id: number, data: any) {
    const response = await this.api.put(`/loans/${id}`, data);
    return response.data;
  }

  async deleteLoan(id: number) {
    const response = await this.api.delete(`/loans/${id}`);
    return response.data;
  }

  async returnBook(id: number) {
    const response = await this.api.post(`/loans/${id}/return`);
    return response.data;
  }

  async getLoansByMember(memberId: number) {
    const response = await this.api.get(`/loans/member/${memberId}`);
    return response.data;
  }

  async getLoansByBook(bookId: number) {
    const response = await this.api.get(`/loans/book/${bookId}`);
    return response.data;
  }

  async getOverdueLoans() {
    const response = await this.api.get('/loans/overdue');
    return response.data;
  }

  async getMyLoans() {
    const response = await this.api.get('/loans/my-loans');
    return response.data;
  }

  // Admin methods
  async getUsers() {
    const response = await this.api.get('/admin/users');
    return response.data;
  }

  async getUser(id: number) {
    const response = await this.api.get(`/admin/users/${id}`);
    return response.data;
  }

  async createUser(data: any) {
    const response = await this.api.post('/admin/users', data);
    return response.data;
  }

  async updateUser(id: number, data: any) {
    const response = await this.api.put(`/admin/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number) {
    const response = await this.api.delete(`/admin/users/${id}`);
    return response.data;
  }

  async changeUserRole(id: number, role: string) {
    const response = await this.api.put(`/admin/users/${id}/role`, { role });
    return response.data;
  }

  async toggleUserStatus(id: number, enabled: boolean) {
    const response = await this.api.put(`/admin/users/${id}/status`, { enabled });
    return response.data;
  }

  async resetUserPassword(id: number, newPassword: string) {
    const response = await this.api.post(`/admin/users/${id}/reset-password`, { newPassword });
    return response.data;
  }

  async getUserStats() {
    const response = await this.api.get('/admin/users/stats');
    return response.data;
  }

  async getUsersByRole(role: string) {
    const response = await this.api.get(`/admin/users/role/${role}`);
    return response.data;
  }

  // Utility methods
  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getUserRole(): string | null {
    return localStorage.getItem('userRole');
  }

  getUsername(): string | null {
    return localStorage.getItem('username');
  }

  storeAuthData(authResponse: AuthResponse) {
    localStorage.setItem('accessToken', authResponse.accessToken);
    localStorage.setItem('refreshToken', authResponse.refreshToken);
    localStorage.setItem('userRole', authResponse.role);
    localStorage.setItem('username', authResponse.username);
  }
}

const apiService = new ApiService();
export default apiService;