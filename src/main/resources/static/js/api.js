// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// API Helper Functions
class LibraryAPI {
    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            
            return response;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Books API
    static async getAllBooks() {
        return this.request('/books');
    }

    static async getBookById(id) {
        return this.request(`/books/${id}`);
    }

    static async createBook(book) {
        return this.request('/books', {
            method: 'POST',
            body: JSON.stringify(book),
        });
    }

    static async updateBook(id, book) {
        return this.request(`/books/${id}`, {
            method: 'PUT',
            body: JSON.stringify(book),
        });
    }

    static async deleteBook(id) {
        return this.request(`/books/${id}`, {
            method: 'DELETE',
        });
    }

    static async getAvailableBooks() {
        return this.request('/books/available');
    }

    static async searchBooks(params) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/books/search?${queryString}`);
    }

    // Members API
    static async getAllMembers() {
        return this.request('/members');
    }

    static async getMemberById(id) {
        return this.request(`/members/${id}`);
    }

    static async createMember(member) {
        return this.request('/members', {
            method: 'POST',
            body: JSON.stringify(member),
        });
    }

    static async updateMember(id, member) {
        return this.request(`/members/${id}`, {
            method: 'PUT',
            body: JSON.stringify(member),
        });
    }

    static async deleteMember(id) {
        return this.request(`/members/${id}`, {
            method: 'DELETE',
        });
    }

    static async searchMembers(params) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/members/search?${queryString}`);
    }

    // Loans API
    static async getAllLoans() {
        return this.request('/loans');
    }

    static async getLoanById(id) {
        return this.request(`/loans/${id}`);
    }

    static async createLoan(loan) {
        return this.request('/loans', {
            method: 'POST',
            body: JSON.stringify(loan),
        });
    }

    static async updateLoan(id, loan) {
        return this.request(`/loans/${id}`, {
            method: 'PUT',
            body: JSON.stringify(loan),
        });
    }

    static async deleteLoan(id) {
        return this.request(`/loans/${id}`, {
            method: 'DELETE',
        });
    }

    static async getLoansByMember(memberId) {
        return this.request(`/loans/member/${memberId}`);
    }

    static async getLoansByBook(bookId) {
        return this.request(`/loans/book/${bookId}`);
    }

    static async getOverdueLoans() {
        return this.request('/loans/overdue');
    }

    static async returnBook(loanId) {
        return this.request(`/loans/${loanId}/return`, {
            method: 'POST',
        });
    }
}

// Utility Functions
class Utils {
    static formatDate(dateString) {
        if (!dateString) return 'Chưa có';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    static formatDateTime(dateString) {
        if (!dateString) return 'Chưa có';
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    }

    static showAlert(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        const container = document.querySelector('.container') || document.body;
        container.insertBefore(alertDiv, container.firstChild);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
    }

    static showLoading(element) {
        element.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin fa-2x"></i>
                <p class="mt-2">Đang tải...</p>
            </div>
        `;
    }

    static getStatusBadge(status) {
        const statusMap = {
            'BORROWED': { class: 'status-borrowed', text: 'Đang Mượn' },
            'RETURNED': { class: 'status-returned', text: 'Đã Trả' },
            'OVERDUE': { class: 'status-overdue', text: 'Quá Hạn' },
            'available': { class: 'status-available', text: 'Có Sẵn' },
            'unavailable': { class: 'status-borrowed', text: 'Đã Mượn' }
        };
        
        const config = statusMap[status] || { class: 'bg-secondary', text: status };
        return `<span class="badge ${config.class}">${config.text}</span>`;
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validateYear(year) {
        const currentYear = new Date().getFullYear();
        return year >= 1000 && year <= currentYear;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static async handleApiError(error, defaultMessage = 'Có lỗi xảy ra') {
        console.error('API Error:', error);
        
        let message = defaultMessage;
        if (error.message.includes('404')) {
            message = 'Không tìm thấy dữ liệu';
        } else if (error.message.includes('400')) {
            message = 'Dữ liệu không hợp lệ';
        } else if (error.message.includes('500')) {
            message = 'Lỗi server, vui lòng thử lại sau';
        } else if (error.message.includes('Failed to fetch')) {
            message = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng và đảm bảo server đang chạy.';
        }
        
        this.showAlert(message, 'danger');
    }
}

// Export for use in other files
window.LibraryAPI = LibraryAPI;
window.Utils = Utils;
