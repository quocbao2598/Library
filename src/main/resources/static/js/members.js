// Members Management JavaScript

let currentMembers = [];
let editingMemberId = null;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadMembers();
    initializeEventListeners();
});

// Load all members
async function loadMembers() {
    const tbody = document.getElementById('membersTableBody');
    const countElement = document.getElementById('totalMembersCount');
    
    try {
        Utils.showLoading(tbody);
        
        const members = await LibraryAPI.getAllMembers();
        currentMembers = members;
        
        // Load loan information for each member
        await loadMembersWithLoans(members);
        
    } catch (error) {
        console.error('Failed to load members:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Không thể tải danh sách thành viên. Vui lòng thử lại.
                </td>
            </tr>
        `;
        Utils.handleApiError(error, 'Không thể tải danh sách thành viên');
    }
}

// Load members with their loan information
async function loadMembersWithLoans(members) {
    const tbody = document.getElementById('membersTableBody');
    const countElement = document.getElementById('totalMembersCount');
    
    try {
        // Get all loans to count borrowed books per member
        const loans = await LibraryAPI.getAllLoans();
        const activeLoansByMember = {};
        
        loans.forEach(loan => {
            if (loan.status === 'BORROWED') {
                const memberId = loan.member?.id || loan.memberId;
                if (!activeLoansByMember[memberId]) {
                    activeLoansByMember[memberId] = 0;
                }
                activeLoansByMember[memberId]++;
            }
        });
        
        displayMembers(members, activeLoansByMember);
        updateMembersCount(members.length);
        
    } catch (error) {
        console.error('Failed to load loan information:', error);
        // Display members without loan info
        displayMembers(members, {});
        updateMembersCount(members.length);
    }
}

// Display members in table
function displayMembers(members, activeLoansByMember = {}) {
    const tbody = document.getElementById('membersTableBody');
    
    if (members.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    <i class="fas fa-users me-2"></i>
                    Chưa có thành viên nào trong hệ thống
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = members.map(member => {
        const borrowedCount = activeLoansByMember[member.id] || 0;
        const joinDate = new Date().toLocaleDateString('vi-VN'); // Mock join date
        
        return `
            <tr class="fade-in-up">
                <td><strong>#${member.id}</strong></td>
                <td>
                    <div class="d-flex align-items-center">
                        <div class="avatar-circle me-3">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <div class="fw-bold">${escapeHtml(member.name)}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="text-muted">
                        <i class="fas fa-envelope me-1"></i>
                        ${escapeHtml(member.email)}
                    </span>
                </td>
                <td>${joinDate}</td>
                <td>
                    ${borrowedCount > 0 
                        ? `<span class="badge bg-warning text-dark">${borrowedCount} cuốn</span>`
                        : `<span class="badge bg-success">0 cuốn</span>`
                    }
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-info" onclick="viewMemberDetails(${member.id})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-primary" onclick="editMember(${member.id})" title="Chỉnh sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteMember(${member.id})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Update members count
function updateMembersCount(count) {
    const countElement = document.getElementById('totalMembersCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

// Search members
async function searchMembers() {
    const name = document.getElementById('searchName').value.trim();
    const email = document.getElementById('searchEmail').value.trim();
    
    try {
        let filteredMembers = [...currentMembers];
        
        // Apply filters
        if (name) {
            filteredMembers = filteredMembers.filter(member => 
                member.name.toLowerCase().includes(name.toLowerCase())
            );
        }
        
        if (email) {
            filteredMembers = filteredMembers.filter(member => 
                member.email.toLowerCase().includes(email.toLowerCase())
            );
        }
        
        await loadMembersWithLoans(filteredMembers);
        
    } catch (error) {
        console.error('Search failed:', error);
        Utils.handleApiError(error, 'Lỗi khi tìm kiếm thành viên');
    }
}

// Clear search
function clearSearch() {
    document.getElementById('searchName').value = '';
    document.getElementById('searchEmail').value = '';
    
    loadMembersWithLoans(currentMembers);
}

// Open add member modal
function openAddMemberModal() {
    editingMemberId = null;
    document.getElementById('memberModalTitle').innerHTML = 
        '<i class="fas fa-user-plus me-2"></i>Thêm Thành Viên Mới';
    
    // Clear form
    document.getElementById('memberForm').reset();
    document.getElementById('memberId').value = '';
    
    // Show password field for new member
    document.getElementById('memberPassword').style.display = 'block';
    document.getElementById('memberPassword').required = true;
    
    const modal = new bootstrap.Modal(document.getElementById('addMemberModal'));
    modal.show();
}

// Edit member
async function editMember(memberId) {
    try {
        const member = await LibraryAPI.getMemberById(memberId);
        
        editingMemberId = memberId;
        document.getElementById('memberModalTitle').innerHTML = 
            '<i class="fas fa-user-edit me-2"></i>Chỉnh Sửa Thành Viên';
        
        // Fill form with member data
        document.getElementById('memberId').value = member.id;
        document.getElementById('memberName').value = member.name;
        document.getElementById('memberEmail').value = member.email;
        
        // Hide password field for editing (or make it optional)
        document.getElementById('memberPassword').value = '';
        document.getElementById('memberPassword').required = false;
        document.getElementById('memberPassword').placeholder = 'Để trống nếu không đổi mật khẩu';
        
        const modal = new bootstrap.Modal(document.getElementById('addMemberModal'));
        modal.show();
        
    } catch (error) {
        console.error('Failed to load member for editing:', error);
        Utils.handleApiError(error, 'Không thể tải thông tin thành viên');
    }
}

// Save member (add or update)
async function saveMember() {
    const form = document.getElementById('memberForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const memberData = {
        name: document.getElementById('memberName').value.trim(),
        email: document.getElementById('memberEmail').value.trim(),
        password: document.getElementById('memberPassword').value.trim()
    };
    
    // Validate data
    if (!validateMemberData(memberData)) {
        return;
    }
    
    try {
        const saveBtn = document.querySelector('#addMemberModal .btn-success');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang lưu...';
        saveBtn.disabled = true;
        
        if (editingMemberId) {
            // Update existing member
            // Don't update password if it's empty
            if (!memberData.password) {
                delete memberData.password;
            }
            await LibraryAPI.updateMember(editingMemberId, memberData);
            Utils.showAlert('Cập nhật thành viên thành công!', 'success');
        } else {
            // Create new member
            await LibraryAPI.createMember(memberData);
            Utils.showAlert('Thêm thành viên mới thành công!', 'success');
        }
        
        // Close modal and refresh list
        const modal = bootstrap.Modal.getInstance(document.getElementById('addMemberModal'));
        modal.hide();
        
        await loadMembers();
        
    } catch (error) {
        console.error('Failed to save member:', error);
        Utils.handleApiError(error, editingMemberId ? 'Không thể cập nhật thành viên' : 'Không thể thêm thành viên');
    } finally {
        const saveBtn = document.querySelector('#addMemberModal .btn-success');
        saveBtn.innerHTML = '<i class="fas fa-save me-2"></i>Lưu';
        saveBtn.disabled = false;
    }
}

// Validate member data
function validateMemberData(memberData) {
    if (!Utils.validateRequired(memberData.name)) {
        Utils.showAlert('Vui lòng nhập họ tên', 'warning');
        return false;
    }
    
    if (!Utils.validateEmail(memberData.email)) {
        Utils.showAlert('Email không hợp lệ', 'warning');
        return false;
    }
    
    // Check password only for new members or when password is provided
    if (!editingMemberId && !Utils.validateRequired(memberData.password)) {
        Utils.showAlert('Vui lòng nhập mật khẩu', 'warning');
        return false;
    }
    
    if (memberData.password && memberData.password.length < 6) {
        Utils.showAlert('Mật khẩu phải có ít nhất 6 ký tự', 'warning');
        return false;
    }
    
    return true;
}

// View member details
async function viewMemberDetails(memberId) {
    const modal = new bootstrap.Modal(document.getElementById('memberDetailsModal'));
    const content = document.getElementById('memberDetailsContent');
    
    try {
        Utils.showLoading(content);
        modal.show();
        
        // Load member and their loans
        const [member, memberLoans] = await Promise.all([
            LibraryAPI.getMemberById(memberId),
            LibraryAPI.getLoansByMember(memberId)
        ]);
        
        const activeLoans = memberLoans.filter(loan => loan.status === 'BORROWED');
        const returnedLoans = memberLoans.filter(loan => loan.status === 'RETURNED');
        const overdueLoans = memberLoans.filter(loan => loan.status === 'OVERDUE');
        
        content.innerHTML = `
            <div class="row">
                <div class="col-md-4">
                    <div class="card">
                        <div class="card-body text-center">
                            <div class="avatar-circle-large mb-3">
                                <i class="fas fa-user fa-3x"></i>
                            </div>
                            <h5>${escapeHtml(member.name)}</h5>
                            <p class="text-muted">${escapeHtml(member.email)}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-8">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="card text-center">
                                <div class="card-body">
                                    <i class="fas fa-book-open text-warning fa-2x mb-2"></i>
                                    <h4>${activeLoans.length}</h4>
                                    <p class="mb-0">Đang Mượn</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card text-center">
                                <div class="card-body">
                                    <i class="fas fa-check-circle text-success fa-2x mb-2"></i>
                                    <h4>${returnedLoans.length}</h4>
                                    <p class="mb-0">Đã Trả</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card text-center">
                                <div class="card-body">
                                    <i class="fas fa-exclamation-triangle text-danger fa-2x mb-2"></i>
                                    <h4>${overdueLoans.length}</h4>
                                    <p class="mb-0">Quá Hạn</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            ${activeLoans.length > 0 ? `
                <div class="mt-4">
                    <h6><i class="fas fa-book-open me-2"></i>Sách Đang Mượn</h6>
                    <div class="table-responsive">
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Tên Sách</th>
                                    <th>Tác Giả</th>
                                    <th>Ngày Mượn</th>
                                    <th>Trạng Thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${activeLoans.map(loan => `
                                    <tr>
                                        <td>${escapeHtml(loan.book?.title || 'N/A')}</td>
                                        <td>${escapeHtml(loan.book?.author || 'N/A')}</td>
                                        <td>${Utils.formatDate(loan.borrowDate)}</td>
                                        <td>${Utils.getStatusBadge(loan.status)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            ` : ''}
        `;
        
    } catch (error) {
        console.error('Failed to load member details:', error);
        content.innerHTML = `
            <div class="text-center text-danger">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <p>Không thể tải thông tin chi tiết thành viên</p>
            </div>
        `;
        Utils.handleApiError(error, 'Không thể tải thông tin thành viên');
    }
}

// Delete member
function deleteMember(memberId) {
    const member = currentMembers.find(m => m.id === memberId);
    
    if (!member) {
        Utils.showAlert('Không tìm thấy thành viên', 'error');
        return;
    }
    
    // Show member info in delete modal
    document.getElementById('memberToDelete').innerHTML = `
        <div class="card">
            <div class="card-body">
                <h6 class="card-title">${escapeHtml(member.name)}</h6>
                <p class="card-text">
                    <strong>Email:</strong> ${escapeHtml(member.email)}
                </p>
            </div>
        </div>
    `;
    
    // Store member ID for deletion
    window.memberToDeleteId = memberId;
    
    const modal = new bootstrap.Modal(document.getElementById('deleteMemberModal'));
    modal.show();
}

// Confirm delete member
async function confirmDeleteMember() {
    const memberId = window.memberToDeleteId;
    
    if (!memberId) {
        Utils.showAlert('Lỗi: Không xác định được thành viên cần xóa', 'error');
        return;
    }
    
    try {
        const deleteBtn = document.querySelector('#deleteMemberModal .btn-danger');
        const originalText = deleteBtn.innerHTML;
        deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Đang xóa...';
        deleteBtn.disabled = true;
        
        await LibraryAPI.deleteMember(memberId);
        
        Utils.showAlert('Xóa thành viên thành công!', 'success');
        
        // Close modal and refresh list
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteMemberModal'));
        modal.hide();
        
        await loadMembers();
        
    } catch (error) {
        console.error('Failed to delete member:', error);
        Utils.handleApiError(error, 'Không thể xóa thành viên');
    } finally {
        const deleteBtn = document.querySelector('#deleteMemberModal .btn-danger');
        deleteBtn.innerHTML = '<i class="fas fa-trash me-2"></i>Xóa';
        deleteBtn.disabled = false;
    }
}

// Initialize event listeners
function initializeEventListeners() {
    // Search on input change with debounce
    const searchInputs = ['searchName', 'searchEmail'];
    searchInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', Utils.debounce(searchMembers, 500));
        }
    });
    
    // Enter key to search
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.target.matches('#searchName, #searchEmail')) {
            searchMembers();
        }
    });
    
    // Form submission
    const memberForm = document.getElementById('memberForm');
    if (memberForm) {
        memberForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveMember();
        });
    }
    
    // Modal events
    const addMemberModal = document.getElementById('addMemberModal');
    if (addMemberModal) {
        addMemberModal.addEventListener('hidden.bs.modal', function() {
            document.getElementById('memberForm').reset();
            editingMemberId = null;
            // Reset password field
            document.getElementById('memberPassword').required = true;
            document.getElementById('memberPassword').placeholder = '';
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
window.loadMembers = loadMembers;
window.searchMembers = searchMembers;
window.clearSearch = clearSearch;
window.openAddMemberModal = openAddMemberModal;
window.editMember = editMember;
window.saveMember = saveMember;
window.viewMemberDetails = viewMemberDetails;
window.deleteMember = deleteMember;
window.confirmDeleteMember = confirmDeleteMember;
