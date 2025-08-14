// Loans Management JavaScript

let currentLoans = [];
let allMembers = [];
let allBooks = [];

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeLoansPage();
});

// Initialize the loans page
async function initializeLoansPage() {
    try {
        // Load all data in parallel
        await Promise.all([
            loadLoans(),
            loadMembersForSelect(),
            loadBooksForSelect()
        ]);
        
        initializeEventListeners();
        
    } catch (error) {
        console.error('Failed to initialize loans page:', error);
        Utils.handleApiError(error, 'Không thể khởi tạo trang quản lý mượn/trả');
    }
}

// Load all loans
async function loadLoans() {
    const tbody = document.getElementById('loansTableBody');
    
    try {
        Utils.showLoading(tbody);
        
        const loans = await LibraryAPI.getAllLoans();
        currentLoans = loans;
        
        displayLoans(loans);
        updateLoanStats(loans);
        
    } catch (error) {
        console.error('Failed to load loans:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Không thể tải danh sách giao dịch. Vui lòng thử lại.
                </td>
            </tr>
        `;
        Utils.handleApiError(error, 'Không thể tải danh sách giao dịch');
    }
}

// Display loans in table
function displayLoans(loans) {
    const tbody = document.getElementById('loansTableBody');
    
    if (loans.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    <i class="fas fa-exchange-alt me-2"></i>
                    Chưa có giao dịch mượn/trả nào
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = loans.map(loan => `
        <tr class="fade-in-up">
            <td><strong>#${loan.id}</strong></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar-circle me-2">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div class="fw-bold">${escapeHtml(loan.member?.name || 'N/A')}</div>
                        <small class="text-muted">${escapeHtml(loan.member?.email || '')}</small>
                    </div>
                </div>
            </td>
            <td>
                <div>
                    <div class="fw-bold">${escapeHtml(loan.book?.title || 'N/A')}</div>
                    <small class="text-muted">Tác giả: ${escapeHtml(loan.book?.author || 'N/A')}</small>
                </div>
            </td>
            <td>${Utils.formatDate(loan.borrowDate)}</td>
            <td>${loan.returnDate ? Utils.formatDate(loan.returnDate) : '<span class="text-muted">Chưa trả</span>'}</td>
            <td>${Utils.getStatusBadge(loan.status)}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-info" onclick="viewLoanDetails(${loan.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${loan.status === 'BORROWED' ? `
                        <button class="btn btn-outline-success" onclick="returnBook(${loan.id})" title="Trả sách">
                            <i class="fas fa-undo"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// Update loan statistics
function updateLoanStats(loans) {
    const borrowed = loans.filter(loan => loan.status === 'BORROWED').length;
    const returned = loans.filter(loan => loan.status === 'RETURNED').length;
    const overdue = loans.filter(loan => loan.status === 'OVERDUE').length;
    
    document.getElementById('borrowedCount').textContent = borrowed;
    document.getElementById('returnedCount').textContent = returned;
    document.getElementById('overdueCount').textContent = overdue;
    document.getElementById('totalLoans').textContent = loans.length;
}

// Load members for select options
async function loadMembersForSelect() {
    try {
        const members = await LibraryAPI.getAllMembers();
        allMembers = members;
        
        const selects = ['filterMember', 'borrowMember'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // Clear existing options (except first one)
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                
                // Add member options
                members.forEach(member => {
                    const option = document.createElement('option');
                    option.value = member.id;
                    option.textContent = `${member.name} (${member.email})`;
                    select.appendChild(option);
                });
            }
        });
        
    } catch (error) {
        console.error('Failed to load members for select:', error);
    }
}

// Load books for select options
async function loadBooksForSelect() {
    try {
        const books = await LibraryAPI.getAllBooks();
        allBooks = books;
        
        const selects = ['filterBook', 'borrowBook'];
        selects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // Clear existing options (except first one)
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                
                // For borrow modal, only show available books
                const booksToShow = selectId === 'borrowBook' 
                    ? books.filter(book => book.available) 
                    : books;
                
                // Add book options
                booksToShow.forEach(book => {
                    const option = document.createElement('option');
                    option.value = book.id;
                    option.textContent = `${book.title} - ${book.author}`;
                    select.appendChild(option);
                });
            }
        });
        
    } catch (error) {
        console.error('Failed to load books for select:', error);
    }
}

// Filter loans
function filterLoans() {
    const status = document.getElementById('filterStatus').value;
    const memberId = document.getElementById('filterMember').value;
    const bookId = document.getElementById('filterBook').value;
    
    let filteredLoans = [...currentLoans];
    
    // Apply filters
    if (status) {
        filteredLoans = filteredLoans.filter(loan => loan.status === status);
    }
    
    if (memberId) {
        filteredLoans = filteredLoans.filter(loan => 
            loan.member && loan.member.id.toString() === memberId
        );
    }
    
    if (bookId) {
        filteredLoans = filteredLoans.filter(loan => 
            loan.book && loan.book.id.toString() === bookId
        );
    }
    
    displayLoans(filteredLoans);
}

// Show overdue loans
function showOverdueLoans() {
    const overdueLoans = currentLoans.filter(loan => loan.status === 'OVERDUE');
    displayLoans(overdueLoans);
    
    // Update filter to show overdue
    document.getElementById('filterStatus').value = 'OVERDUE';
}

// Open borrow modal
function openBorrowModal() {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('borrowDate').value = today;
    
    // Reset form
    document.getElementById('borrowForm').reset();
    document.getElementById('borrowDate').value = today;
    
    // Reload available books
    loadBooksForSelect();
    
    const modal = new bootstrap.Modal(document.getElementById('borrowModal'));
    modal.show();
}

// Process borrow
async function processBorrow() {
    const form = document.getElementById('borrowForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const memberId = document.getElementById('borrowMember').value;
    const bookId = document.getElementById('borrowBook').value;
    const borrowDate = document.getElementById('borrowDate').value;
    
    if (!memberId || !bookId) {
        Utils.showAlert('Vui lòng chọn thành viên và sách', 'warning');
        return;
    }
    
    try {
        const borrowBtn = document.querySelector('#borrowModal .btn-success');
        const originalText = borrowBtn.innerHTML;
        borrowBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...';
        borrowBtn.disabled = true;
        
        // Create loan object
        const loanData = {
            member: { id: parseInt(memberId) },
            book: { id: parseInt(bookId) },
            borrowDate: borrowDate,
            status: 'BORROWED'
        };
        
        await LibraryAPI.createLoan(loanData);
        
        Utils.showAlert('Mượn sách thành công!', 'success');
        
        // Close modal and refresh
        const modal = bootstrap.Modal.getInstance(document.getElementById('borrowModal'));
        modal.hide();
        
        await Promise.all([
            loadLoans(),
            loadBooksForSelect() // Refresh available books
        ]);
        
    } catch (error) {
        console.error('Failed to process borrow:', error);
        Utils.handleApiError(error, 'Không thể xử lý mượn sách');
    } finally {
        const borrowBtn = document.querySelector('#borrowModal .btn-success');
        borrowBtn.innerHTML = '<i class="fas fa-check me-2"></i>Mượn Sách';
        borrowBtn.disabled = false;
    }
}

// Return book
function returnBook(loanId) {
    const loan = currentLoans.find(l => l.id === loanId);
    
    if (!loan) {
        Utils.showAlert('Không tìm thấy giao dịch', 'error');
        return;
    }
    
    // Show loan info in return modal
    document.getElementById('loanToReturn').innerHTML = `
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">Chi tiết giao dịch</h6>
                <p class="card-text">
                    <strong>Thành viên:</strong> ${escapeHtml(loan.member?.name || 'N/A')}<br>
                    <strong>Sách:</strong> ${escapeHtml(loan.book?.title || 'N/A')}<br>
                    <strong>Tác giả:</strong> ${escapeHtml(loan.book?.author || 'N/A')}<br>
                    <strong>Ngày mượn:</strong> ${Utils.formatDate(loan.borrowDate)}
                </p>
            </div>
        </div>
    `;
    
    // Store loan ID for return
    window.loanToReturnId = loanId;
    
    const modal = new bootstrap.Modal(document.getElementById('returnModal'));
    modal.show();
}

// Confirm return book
async function confirmReturnBook() {
    const loanId = window.loanToReturnId;
    
    if (!loanId) {
        Utils.showAlert('Lỗi: Không xác định được giao dịch cần trả', 'error');
        return;
    }
    
    try {
        const returnBtn = document.querySelector('#returnModal .btn-success');
        const originalText = returnBtn.innerHTML;
        returnBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xử lý...';
        returnBtn.disabled = true;
        
        await LibraryAPI.returnBook(loanId);
        
        Utils.showAlert('Trả sách thành công!', 'success');
        
        // Close modal and refresh
        const modal = bootstrap.Modal.getInstance(document.getElementById('returnModal'));
        modal.hide();
        
        await Promise.all([
            loadLoans(),
            loadBooksForSelect() // Refresh available books
        ]);
        
    } catch (error) {
        console.error('Failed to return book:', error);
        Utils.handleApiError(error, 'Không thể xử lý trả sách');
    } finally {
        const returnBtn = document.querySelector('#returnModal .btn-success');
        returnBtn.innerHTML = '<i class="fas fa-check me-2"></i>Xác Nhận Trả';
        returnBtn.disabled = false;
    }
}

// View loan details
async function viewLoanDetails(loanId) {
    const modal = new bootstrap.Modal(document.getElementById('loanDetailsModal'));
    const content = document.getElementById('loanDetailsContent');
    
    try {
        Utils.showLoading(content);
        modal.show();
        
        const loan = await LibraryAPI.getLoanById(loanId);
        
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h6><i class="fas fa-user me-2"></i>Thông Tin Thành Viên</h6>
                        </div>
                        <div class="card-body">
                            <p><strong>Tên:</strong> ${escapeHtml(loan.member?.name || 'N/A')}</p>
                            <p><strong>Email:</strong> ${escapeHtml(loan.member?.email || 'N/A')}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h6><i class="fas fa-book me-2"></i>Thông Tin Sách</h6>
                        </div>
                        <div class="card-body">
                            <p><strong>Tên sách:</strong> ${escapeHtml(loan.book?.title || 'N/A')}</p>
                            <p><strong>Tác giả:</strong> ${escapeHtml(loan.book?.author || 'N/A')}</p>
                            <p><strong>Thể loại:</strong> ${escapeHtml(loan.book?.genre || 'N/A')}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="row mt-3">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h6><i class="fas fa-info-circle me-2"></i>Chi Tiết Giao Dịch</h6>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <p><strong>Mã GD:</strong> #${loan.id}</p>
                                </div>
                                <div class="col-md-3">
                                    <p><strong>Ngày mượn:</strong> ${Utils.formatDate(loan.borrowDate)}</p>
                                </div>
                                <div class="col-md-3">
                                    <p><strong>Ngày trả:</strong> ${loan.returnDate ? Utils.formatDate(loan.returnDate) : 'Chưa trả'}</p>
                                </div>
                                <div class="col-md-3">
                                    <p><strong>Trạng thái:</strong> ${Utils.getStatusBadge(loan.status)}</p>
                                </div>
                            </div>
                            
                            ${loan.status === 'BORROWED' ? `
                                <div class="mt-3">
                                    <button class="btn btn-success" onclick="returnBookFromDetails(${loan.id})">
                                        <i class="fas fa-undo me-2"></i>Trả Sách
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Failed to load loan details:', error);
        content.innerHTML = `
            <div class="text-center text-danger">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <p>Không thể tải thông tin chi tiết giao dịch</p>
            </div>
        `;
        Utils.handleApiError(error, 'Không thể tải thông tin giao dịch');
    }
}

// Return book from details modal
async function returnBookFromDetails(loanId) {
    try {
        await LibraryAPI.returnBook(loanId);
        
        Utils.showAlert('Trả sách thành công!', 'success');
        
        // Close details modal and refresh
        const modal = bootstrap.Modal.getInstance(document.getElementById('loanDetailsModal'));
        modal.hide();
        
        await Promise.all([
            loadLoans(),
            loadBooksForSelect()
        ]);
        
    } catch (error) {
        console.error('Failed to return book from details:', error);
        Utils.handleApiError(error, 'Không thể xử lý trả sách');
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Filter change events
    const filterElements = ['filterStatus', 'filterMember', 'filterBook'];
    filterElements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', filterLoans);
        }
    });
    
    // Form submission
    const borrowForm = document.getElementById('borrowForm');
    if (borrowForm) {
        borrowForm.addEventListener('submit', function(e) {
            e.preventDefault();
            processBorrow();
        });
    }
    
    // Modal events
    const borrowModal = document.getElementById('borrowModal');
    if (borrowModal) {
        borrowModal.addEventListener('hidden.bs.modal', function() {
            document.getElementById('borrowForm').reset();
        });
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export functions for global use
window.loadLoans = loadLoans;
window.filterLoans = filterLoans;
window.showOverdueLoans = showOverdueLoans;
window.openBorrowModal = openBorrowModal;
window.processBorrow = processBorrow;
window.returnBook = returnBook;
window.confirmReturnBook = confirmReturnBook;
window.viewLoanDetails = viewLoanDetails;
window.returnBookFromDetails = returnBookFromDetails;
