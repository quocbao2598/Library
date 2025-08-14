// Books Management JavaScript

let currentBooks = [];
let editingBookId = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadBooks();
    initializeEventListeners();
});

// Load all books
async function loadBooks() {
    const tbody = document.getElementById('booksTableBody');
    const countElement = document.getElementById('totalBooksCount');
    
    try {
        Utils.showLoading(tbody);
        
        const books = await LibraryAPI.getAllBooks();
        currentBooks = books;
        
        displayBooks(books);
        updateBooksCount(books.length);
        
    } catch (error) {
        console.error('Failed to load books:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Không thể tải danh sách sách. Vui lòng thử lại.
                </td>
            </tr>
        `;
        Utils.handleApiError(error, 'Không thể tải danh sách sách');
    }
}

// Display books in table
function displayBooks(books) {
    const tbody = document.getElementById('booksTableBody');
    
    if (books.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">
                    <i class="fas fa-book-open me-2"></i>
                    Không có sách nào trong thư viện
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = books.map(book => `
        <tr class="fade-in-up">
            <td><strong>#${book.id}</strong></td>
            <td>
                <div class="fw-bold">${escapeHtml(book.title)}</div>
            </td>
            <td>${escapeHtml(book.author)}</td>
            <td>
                <span class="badge bg-info">${escapeHtml(book.genre)}</span>
            </td>
            <td>${book.publishedYear}</td>
            <td>
                ${Utils.getStatusBadge(book.available ? 'available' : 'unavailable')}
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editBook(${book.id})" title="Chỉnh sửa">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteBook(${book.id})" title="Xóa">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update books count
function updateBooksCount(count) {
    const countElement = document.getElementById('totalBooksCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Search books
async function searchBooks() {
    const title = document.getElementById('searchTitle').value.trim();
    const author = document.getElementById('searchAuthor').value.trim();
    const genre = document.getElementById('searchGenre').value;
    const available = document.getElementById('filterAvailable').value;
    
    try {
        let filteredBooks = [...currentBooks];
        
        // Apply filters
        if (title) {
            filteredBooks = filteredBooks.filter(book => 
                book.title.toLowerCase().includes(title.toLowerCase())
            );
        }
        
        if (author) {
            filteredBooks = filteredBooks.filter(book => 
                book.author.toLowerCase().includes(author.toLowerCase())
            );
        }
        
        if (genre) {
            filteredBooks = filteredBooks.filter(book => book.genre === genre);
        }
        
        if (available !== '') {
            const isAvailable = available === 'true';
            filteredBooks = filteredBooks.filter(book => book.available === isAvailable);
        }
        
        displayBooks(filteredBooks);
        updateBooksCount(filteredBooks.length);
        
    } catch (error) {
        console.error('Search failed:', error);
        Utils.handleApiError(error, 'Lỗi khi tìm kiếm sách');
    }
}

// Clear search
function clearSearch() {
    document.getElementById('searchTitle').value = '';
    document.getElementById('searchAuthor').value = '';
    document.getElementById('searchGenre').value = '';
    document.getElementById('filterAvailable').value = '';
    
    displayBooks(currentBooks);
    updateBooksCount(currentBooks.length);
}

// Open add book modal
function openAddBookModal() {
    editingBookId = null;
    document.getElementById('bookModalTitle').innerHTML = 
        '<i class="fas fa-plus-circle me-2"></i>Thêm Sách Mới';
    
    // Clear form
    document.getElementById('bookForm').reset();
    document.getElementById('bookId').value = '';
    document.getElementById('bookAvailable').checked = true;
    
    const modal = new bootstrap.Modal(document.getElementById('addBookModal'));
    modal.show();
}

// Edit book
async function editBook(bookId) {
    try {
        const book = await LibraryAPI.getBookById(bookId);
        
        editingBookId = bookId;
        document.getElementById('bookModalTitle').innerHTML = 
            '<i class="fas fa-edit me-2"></i>Chỉnh Sửa Sách';
        
        // Fill form with book data
        document.getElementById('bookId').value = book.id;
        document.getElementById('bookTitle').value = book.title;
        document.getElementById('bookAuthor').value = book.author;
        document.getElementById('bookGenre').value = book.genre;
        document.getElementById('bookYear').value = book.publishedYear;
        document.getElementById('bookAvailable').checked = book.available;
        
        const modal = new bootstrap.Modal(document.getElementById('addBookModal'));
        modal.show();
        
    } catch (error) {
        console.error('Failed to load book for editing:', error);
        Utils.handleApiError(error, 'Không thể tải thông tin sách');
    }
}

// Save book (add or update)
async function saveBook() {
    const form = document.getElementById('bookForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const bookData = {
        title: document.getElementById('bookTitle').value.trim(),
        author: document.getElementById('bookAuthor').value.trim(),
        genre: document.getElementById('bookGenre').value,
        publishedYear: parseInt(document.getElementById('bookYear').value),
        available: document.getElementById('bookAvailable').checked
    };
    
    // Validate data
    if (!validateBookData(bookData)) {
        return;
    }
    
    try {
        const saveBtn = document.querySelector('#addBookModal .btn-primary');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang lưu...';
        saveBtn.disabled = true;
        
        if (editingBookId) {
            // Update existing book
            await LibraryAPI.updateBook(editingBookId, bookData);
            Utils.showAlert('Cập nhật sách thành công!', 'success');
        } else {
            // Create new book
            await LibraryAPI.createBook(bookData);
            Utils.showAlert('Thêm sách mới thành công!', 'success');
        }
        
        // Close modal and refresh list
        const modal = bootstrap.Modal.getInstance(document.getElementById('addBookModal'));
        modal.hide();
        
        await loadBooks();
        
    } catch (error) {
        console.error('Failed to save book:', error);
        Utils.handleApiError(error, editingBookId ? 'Không thể cập nhật sách' : 'Không thể thêm sách');
    } finally {
        const saveBtn = document.querySelector('#addBookModal .btn-primary');
        saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Lưu';
        saveBtn.disabled = false;
    }
}

// Validate book data
function validateBookData(bookData) {
    if (!Utils.validateRequired(bookData.title)) {
        Utils.showAlert('Vui lòng nhập tên sách', 'warning');
        return false;
    }
    
    if (!Utils.validateRequired(bookData.author)) {
        Utils.showAlert('Vui lòng nhập tên tác giả', 'warning');
        return false;
    }
    
    if (!Utils.validateRequired(bookData.genre)) {
        Utils.showAlert('Vui lòng chọn thể loại', 'warning');
        return false;
    }
    
    if (!Utils.validateYear(bookData.publishedYear)) {
        Utils.showAlert('Năm xuất bản không hợp lệ', 'warning');
        return false;
    }
    
    return true;
}

// Delete book
function deleteBook(bookId) {
    const book = currentBooks.find(b => b.id === bookId);
    
    if (!book) {
        Utils.showAlert('Không tìm thấy sách', 'error');
        return;
    }
    
    // Show book info in delete modal
    document.getElementById('bookToDelete').innerHTML = `
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">${escapeHtml(book.title)}</h6>
                <p class="card-text">
                    <strong>Tác giả:</strong> ${escapeHtml(book.author)}<br>
                    <strong>Thể loại:</strong> ${escapeHtml(book.genre)}<br>
                    <strong>Năm XB:</strong> ${book.publishedYear}
                </p>
            </div>
        </div>
    `;
    
    // Store book ID for deletion
    window.bookToDeleteId = bookId;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteBookModal'));
    modal.show();
}

// Confirm delete book
async function confirmDeleteBook() {
    const bookId = window.bookToDeleteId;
    
    if (!bookId) {
        Utils.showAlert('Lỗi: Không xác định được sách cần xóa', 'error');
        return;
    }
    
    try {
        const deleteBtn = document.querySelector('#deleteBookModal .btn-danger');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xóa...';
        deleteBtn.disabled = true;
        
        await LibraryAPI.deleteBook(bookId);
        
        Utils.showAlert('Xóa sách thành công!', 'success');
        
        // Close modal and refresh list
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteBookModal'));
        modal.hide();
        
        await loadBooks();
        
    } catch (error) {
        console.error('Failed to delete book:', error);
        Utils.handleApiError(error, 'Không thể xóa sách');
    } finally {
        const deleteBtn = document.querySelector('#deleteBookModal .btn-danger');
        deleteBtn.innerHTML = '<i class="fas fa-trash me-2"></i>Xóa';
        deleteBtn.disabled = false;
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Search on input change with debounce
    const searchInputs = ['searchTitle', 'searchAuthor'];
    searchInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', Utils.debounce(searchBooks, 500));
        }
    });
    
    // Search on select change
    const searchSelects = ['searchGenre', 'filterAvailable'];
    searchSelects.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', searchBooks);
        }
    });
    
    // Enter key to search
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.matches('#searchTitle, #searchAuthor')) {
            searchBooks();
        }
    });
    
    // Form submission
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveBook();
        });
    }
    
    // Modal events
    const addBookModal = document.getElementById('addBookModal');
    if (addBookModal) {
        addBookModal.addEventListener('hidden.bs.modal', function() {
            document.getElementById('bookForm').reset();
            editingBookId = null;
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
window.loadBooks = loadBooks;
window.searchBooks = searchBooks;
window.clearSearch = clearSearch;
window.openAddBookModal = openAddBookModal;
window.editBook = editBook;
window.saveBook = saveBook;
window.deleteBook = deleteBook;
window.confirmDeleteBook = confirmDeleteBook;
